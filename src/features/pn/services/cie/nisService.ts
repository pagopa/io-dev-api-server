import { cwd } from "process";
import fs from "fs";
import path from "path";
import forge from "node-forge";
import { Either, left, right } from "fp-ts/lib/Either";
import { unknownToString } from "../../../../utils/error";

export const verifyNISSOD = (
  sodIasHexString: string,
  logDebugMessages: boolean = false
): Either<string, void> => {
  try {
    // Extract the Document Signing Certificate (DSC)
    const sodIasBuffer = Buffer.from(sodIasHexString, "hex");
    const sodIasByteStringBuffer = new forge.util.ByteStringBuffer(
      sodIasBuffer
    );
    const sodIasASN1Der = forge.asn1.fromDer(sodIasByteStringBuffer, {
      parseAllBytes: false
    });
    const certificate =
      eIdentityCardSignerCertificateFromASN1DER(sodIasASN1Der);
    if (logDebugMessages) {
      const dscSubject = certificate.subject.attributes
        .map(attr => `${attr.shortName ?? attr.name}=${attr.value}`)
        .join(", ");
      const dscIssuer = certificate.issuer.attributes
        .map(attr => `${attr.shortName ?? attr.name}=${attr.value}`)
        .join(", ");
      consoleLogIfNeeed(
        `   -> SOD IAS Signer (Subject): ${dscSubject}`,
        logDebugMessages
      );
      consoleLogIfNeeed(
        `   -> Emitted by (Issuer):   ${dscIssuer}`,
        logDebugMessages
      );
    }

    // Build the Trust Store (Trust Bundle) from CSCA certificates
    const cscaFolderAbsolutePath = getCSCAFolderAbsolutePath();
    if (!fs.existsSync(cscaFolderAbsolutePath)) {
      return commonFailureHandling(
        `CSCA folder with certificates does not exist (${cscaFolderAbsolutePath})`,
        logDebugMessages
      );
    }
    const caStore = forge.pki.createCaStore();
    const cscaCertificateFiles = fs
      .readdirSync(cscaFolderAbsolutePath)
      .filter(file => file.toLowerCase().endsWith(".cer"));

    if (cscaCertificateFiles.length === 0) {
      return commonFailureHandling(
        `There are no .cer files in the CSCA folder (${cscaFolderAbsolutePath})`,
        logDebugMessages
      );
    }

    for (const certFile of cscaCertificateFiles) {
      const certPath = path.join(cscaFolderAbsolutePath, certFile);
      const certDer = fs.readFileSync(certPath);
      const certDerBytes = certDer.toString("binary");
      const certDerASN1 = forge.asn1.fromDer(certDerBytes);
      const cert = forge.pki.certificateFromAsn1(certDerASN1);

      // Compute the SHA1 of the certificate
      const certSHA1MD = forge.md.sha1.create();
      certSHA1MD.update(certDerBytes);
      const certificateSha1Hex = certSHA1MD.digest().toHex().toUpperCase();

      // Read the stored SHA1 (it must be stored in a file that has the
      // same name as the certificate's file but with the .sha1 extension)
      const sha1FilenameWithExtension = `${path.basename(
        certFile,
        path.extname(certFile)
      )}.sha1`;
      const sha1FileAbsolutePath = path.join(
        cscaFolderAbsolutePath,
        sha1FilenameWithExtension
      );
      const sha1 = fs.readFileSync(sha1FileAbsolutePath, "utf8").toUpperCase();

      // Compare computed SHA1 and stored SHA1
      if (certificateSha1Hex !== sha1) {
        return commonFailureHandling(
          `Certificate SHA1 does not match with expected one\nActual:   ${certificateSha1Hex}\nExpected: ${sha1}`,
          logDebugMessages
        );
      }

      caStore.addCertificate(cert);

      // Check if this CSCA is the issuer of our DSC (only for logging)
      if (logDebugMessages && certificate.isIssuer(cert)) {
        consoleLogIfNeeed(
          `Parent CSCA certificate found (${certFile})`,
          logDebugMessages
        );
      }
    }

    // Verify the certificate chain
    if (!forge.pki.verifyCertificateChain(caStore, [certificate])) {
      return commonFailureHandling(
        `DSC chain of trust is invalid`,
        logDebugMessages
      );
    }
    consoleLogIfNeeed(
      `DSC chain of trust verified successfully`,
      logDebugMessages
    );
    return right(undefined);
  } catch (error) {
    const reason = unknownToString(error);
    return commonFailureHandling(reason, logDebugMessages);
  }
};

export const verifyNIS = (
  expectedSignatureHex: string,
  expectedSignedAttributesHex: string,
  nisInputHex: string,
  nisPublicKeyHex: string,
  sodHexString: string,
  logDebugMessages: boolean = false
): Either<string, void> => {
  try {
    const buffer = Buffer.from(sodHexString, "hex");
    const byteStringBuffer = new forge.util.ByteStringBuffer(buffer);
    const asn1Der = forge.asn1.fromDer(byteStringBuffer, {
      parseAllBytes: false
    });

    const hashesOctectBlockBytes = signedDataGroupHashesFromASN1DER(asn1Der);
    const sha256MD = forge.md.sha256.create();
    sha256MD.update(hashesOctectBlockBytes);
    const calculatedDigestHex = sha256MD.digest().toHex().toUpperCase();

    const digestOctetBlockBytes = messageDigestFromASN1DER(asn1Der);
    const digestOctetBlockHex = bytesToUppercaseHex(digestOctetBlockBytes);
    if (digestOctetBlockHex !== calculatedDigestHex) {
      return commonFailureHandling(
        `The calculated SHA-256 digest does NOT match the expected one\nExpected: ${digestOctetBlockHex}\nComputed: ${calculatedDigestHex}`,
        logDebugMessages
      );
    }
    consoleLogIfNeeed(
      "The calculated SHA-256 digest matches the expected one",
      logDebugMessages
    );

    const hashedDataGroups = hashedDataGroupsFromASN1DER(asn1Der);
    const hashesASN1Der = forge.asn1.fromDer(hashedDataGroups, {
      parseAllBytes: false
    });

    const decodedNisStringBytes = forge.util.hexToBytes(nisInputHex);
    const sha256MDNIS = forge.md.sha256.create();
    sha256MDNIS.update(decodedNisStringBytes);
    const calculatedNishHashHex = sha256MDNIS.digest().toHex().toUpperCase();

    const foundDataGroupASN1 = dataGroupMatchingFromHashesAS1DR(
      hashesASN1Der,
      calculatedNishHashHex
    );

    if (foundDataGroupASN1 == null) {
      return commonFailureHandling(
        `Calculated hash (NIS) NOT found in the SOD`,
        logDebugMessages
      );
    }
    const dataGroupNIS = dataGroupBytesFromASN1DER(foundDataGroupASN1);
    consoleLogIfNeeed(
      `Calculated hash (NIS) found in the SOD, DG: ${
        dataGroupNIS != null ? bytesToUppercaseHex(dataGroupNIS) : undefined
      }`,
      logDebugMessages
    );

    const nisPublicKeyBytes = forge.util.hexToBytes(nisPublicKeyHex);
    const sha256PublicKeyMD = forge.md.sha256.create();
    sha256PublicKeyMD.update(nisPublicKeyBytes);
    const calculatedInputPublicKeyHashHex = sha256PublicKeyMD
      .digest()
      .toHex()
      .toUpperCase();

    const foundInputPublicKeyASN1 = dataGroupMatchingFromHashesAS1DR(
      hashesASN1Der,
      calculatedInputPublicKeyHashHex
    );
    if (foundInputPublicKeyASN1 == null) {
      return commonFailureHandling(
        `Calculated hash (PubK) NOT found in the SOD`,
        logDebugMessages
      );
    }
    const dataGroupPubK = dataGroupBytesFromASN1DER(foundInputPublicKeyASN1);
    consoleLogIfNeeed(
      `Calculated hash (PubK) found in the SOD, DG: ${
        dataGroupPubK != null ? bytesToUppercaseHex(dataGroupPubK) : undefined
      }`,
      logDebugMessages
    );

    const canonizedSignedAttributes = canonizeSignedAttributes(asn1Der);
    const canonizedSignedAttributesHex = forge.asn1
      .toDer(canonizedSignedAttributes)
      .toHex()
      .toUpperCase();
    if (canonizedSignedAttributesHex !== expectedSignedAttributesHex) {
      return commonFailureHandling(
        `Content of signed_attrs_set DIFFERENT from expected\nExpected: ${expectedSignedAttributesHex}\nComputed: ${canonizedSignedAttributesHex}\n`,
        logDebugMessages
      );
    }
    consoleLogIfNeeed(
      "Content of signed_attrs_set matches the expected value",
      logDebugMessages
    );

    const signatureBytes = signatureFromASN1DER(asn1Der);
    const signatureHex = bytesToUppercaseHex(signatureBytes);
    if (signatureHex !== expectedSignatureHex) {
      return commonFailureHandling(
        `Content of signature DIFFERENT from expected\nExpected: ${expectedSignatureHex}\nComputed: ${signatureHex}\n`,
        logDebugMessages
      );
    }
    consoleLogIfNeeed(
      "Content of signature matches the expected value",
      logDebugMessages
    );

    const replacedSignedAttributesWrapperBytes = forge.util.hexToBytes(
      canonizedSignedAttributesHex
    );
    const sha1ReplaceSignedAttributesMD = forge.md.sha1.create();
    sha1ReplaceSignedAttributesMD.update(replacedSignedAttributesWrapperBytes);
    const replacedSignedAttributesSHA1Bytes = sha1ReplaceSignedAttributesMD
      .digest()
      .getBytes();

    const certificate = eIdentityCardSignerCertificateFromASN1DER(asn1Der);
    const publicKey = certificate.publicKey as forge.pki.rsa.PublicKey;
    if (!publicKey.verify(replacedSignedAttributesSHA1Bytes, signatureBytes)) {
      return commonFailureHandling(
        "Signature verification failed! The digital signature of the SOD is not valid",
        logDebugMessages
      );
    }
    consoleLogIfNeeed(
      "Signature verification passed! The digital signature of the Document Security Object is valid",
      logDebugMessages
    );

    return right(undefined);
  } catch (error) {
    const reason = unknownToString(error);
    return commonFailureHandling(reason, logDebugMessages);
  }
};

/**
 * Canonizes the SignedAttributes ASN.1 object for cryptographic verification.
 *
 * @param input The original global parsed ASN.1 object, containing the `signedAttributes`
 * field, which is extracted (signedAttributesWrapperFromASN1DER) from a CMS `SignerInfo`
 * structure. This object has a context-specific tag `[0]` (byte `0xA0`) due to its
 * `IMPLICIT` definition in the standard.
 *
 * @returns A new, canonical ASN.1 `SET` object. This new object has the universal `SET`
 * tag (byte `0x31`) but contains the exact same children as the input. The DER-encoded
 * bytes of this returned object are the correct data to be hashed for signature verification.
 *
 * @description
 * ## DETAILED EXPLANATION: WHY IS THIS FUNCTION NECESSARY?
 *
 * To successfully verify a digital signature, a cardinal rule must be followed:
 * **You must hash the *exact same sequence of bytes* that the original signer hashed.**
 * This function is necessary because the raw `signedAttributes` block extracted from the
 * SOD is NOT the data that was originally hashed.
 *
 * **The Problem: Context-Specific vs. Universal Tags**
 *
 * 1.  **ASN.1 Definition:** The `signedAttributes` field in the CMS standard is defined as
 * `[0] IMPLICIT SET OF Attribute`.
 * 2.  **`IMPLICIT` Tagging:** The keyword `IMPLICIT` means that the universal ASN.1 tag for a `SET`
 * (which is `0x31`) is completely **replaced** by a local, context-specific tag. In this case,
 * the tag is `[0]`, which is encoded as the byte `0xA0`.
 * 3.  **Canonicalization Rule:** Before signing, cryptographic standards require that the data
 * is "canonized"—put into a standard, unambiguous form. For a `SET OF Attribute`, the
 * canonical form **must** start with the universal `SET` tag (`0x31`).
 * 4.  **The Mismatch:** The signer originally hashed a block of data starting with `0x31`.
 * However, the block we extract from the full `SignerInfo` structure starts with `0xA0`.
 * If we were to hash this extracted block directly, our resulting hash would be different,
 * and the signature verification would **incorrectly fail**, even if the data is valid.
 *
 * This function:
 * - Takes the the `children` array out of the original `CONTEXT_SPECIFIC` wrapper (`0xA0`).
 * - Creates a new, standard `UNIVERSAL SET` wrapper (`0x31`).
 * - Places the original children inside this new, correct wrapper.
 *
 * The serialized output of the object returned by this function is the byte-for-byte correct
 * data needed for the final hash calculation and signature verification.
 */
export const canonizeSignedAttributes = (
  input: forge.asn1.Asn1
): forge.asn1.Asn1 => {
  const signedAttributesWrapper = signedAttributesWrapperFromASN1DER(input);

  return forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.SET,
    true,
    signedAttributesWrapper.value
  );
};

export const dataGroupBytesFromASN1DER = (
  input: forge.asn1.Asn1
): string | undefined => {
  const children = input.value;
  if (typeof children === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 0");
  }

  const dataGroupNode = children.find(
    child =>
      child.type === forge.asn1.Type.INTEGER && typeof child.value === "string"
  );
  if (dataGroupNode != null && typeof dataGroupNode.value === "string") {
    return dataGroupNode.value;
  }
  return undefined;
};

export const dataGroupMatchingFromHashesAS1DR = (
  input: forge.asn1.Asn1,
  match: string
): forge.asn1.Asn1 | undefined => {
  const children = input.value;
  if (typeof children === "string") {
    return undefined;
  }

  const matchingChild = children.find(
    child =>
      child.type === forge.asn1.Type.OCTETSTRING &&
      typeof child.value === "string" &&
      bytesToUppercaseHex(child.value) === match.toUpperCase() &&
      children.some(aChild => aChild.type === forge.asn1.Type.INTEGER)
  );
  if (matchingChild != null) {
    return input;
  }

  for (const child of children) {
    const maybeMatchNode = dataGroupMatchingFromHashesAS1DR(child, match);
    if (maybeMatchNode) {
      return maybeMatchNode;
    }
  }

  return undefined;
};

export const eIdentityCardSignerCertificateFromASN1DER = (
  input: forge.asn1.Asn1
): forge.pki.Certificate => {
  const signedDataSequence = signedDataSequenceFromASN1DER(input);

  // The SignedData SEQUENCE contains several children:
  // [0]: version (INTEGER)
  // [1]: digestAlgorithms (SET)
  // [2]: encapContentInfo (SEQUENCE)
  // [3]: certificates (SET, optional)
  // [4]: signerInfos (SET)
  const certificates =
    signedDataSequence.value[signedDataSequence.value.length - 2];
  if (typeof certificates === "string") {
    throw Error(
      `Raw value found inside of ASN1 node at depth 3, child ${
        signedDataSequence.value.length - 2
      }`
    );
  }

  const eIdentityCardSignerSequence = certificates.value[0];
  if (typeof eIdentityCardSignerSequence === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child 0");
  }
  return forge.pki.certificateFromAsn1(eIdentityCardSignerSequence);
};

export const hashedDataGroupsFromASN1DER = (input: forge.asn1.Asn1): string => {
  const signedDataSequence = signedDataSequenceFromASN1DER(input);

  // Inside SignedData, find the signerInfos SET
  // The SignedData SEQUENCE contains several children:
  // [0]: version (INTEGER)
  // [1]: digestAlgorithms (SET)
  // [2]: encapContentInfo (SEQUENCE)
  // [3]: certificates (SET, optional)
  // [4]: signerInfos (SET)
  const encapContentInfo = signedDataSequence.value[2];
  if (typeof encapContentInfo === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 3, child at 4");
  }

  // Inside EncapsulatedContentInfo, find the eContent OCTET STRING.
  // The EncapsulatedContentInfo SEQUENCE contains:
  // [0]: eContentType (OID)
  // [1]: eContent (the OCTET STRING, wrapped in a context-specific tag [0])
  const eContentWrapper = encapContentInfo.value[1];
  if (typeof eContentWrapper === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child at 1");
  }

  // Unwrap the eContent from its context-specific tag [0] to get the OCTET STRING.
  const eContentOctetString = eContentWrapper.value[0];
  if (typeof eContentOctetString === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 5, child at 0");
  }

  // Step 5: Extract the raw binary value from the OCTET STRING.
  // This value is the DER-encoded ldsSecurityObject structure.
  const ldsSecurityObjectBinaryString = eContentOctetString.value;
  if (typeof ldsSecurityObjectBinaryString !== "string") {
    throw Error(`Object value found inside of ASN1 node at depth 6`);
  }

  return ldsSecurityObjectBinaryString;
};

export const messageDigestFromASN1DER = (input: forge.asn1.Asn1): string => {
  const signedAttributesWrapper = signedAttributesWrapperFromASN1DER(input);

  // Find the messageDigest Attribute SEQUENCE within the SET
  // The SET contains multiple Attribute SEQUENCEs. We need to find the one with the
  // OID for messageDigest (1.2.840.113549.1.9.4) and it should be the second attribute in the set.
  // Attribute[0] is contentType, Attribute[1] is messageDigest.
  const messageDigestAttributeSequence = signedAttributesWrapper.value[1];
  if (typeof messageDigestAttributeSequence === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 6, child at 1");
  }

  // Inside the Attribute, get the SET of its values
  // An Attribute SEQUENCE contains:
  // [0]: attrType (OID)
  // [1]: attrValues (SET)
  const valuesSet = messageDigestAttributeSequence.value[1];
  if (typeof valuesSet === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 7, child at 1");
  }

  // Get the OCTET STRING from the SET of values. This SET contains the actual value, which is our target OCTET STRING.
  const messageDigestOctetString = valuesSet.value[0];
  if (typeof messageDigestOctetString === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 8, child at 0");
  }

  // Extract the raw binary value
  const messageDigestBinaryString = messageDigestOctetString.value;
  if (typeof messageDigestBinaryString !== "string") {
    throw Error(`Object value found inside of ASN1 node at depth 9`);
  }

  return messageDigestBinaryString;
};

export const signatureFromASN1DER = (input: forge.asn1.Asn1): string => {
  const signedDataSequence = signedDataSequenceFromASN1DER(input);

  // The SignedData SEQUENCE contains several children:
  // [0]: version (INTEGER)
  // [1]: digestAlgorithms (SET)
  // [2]: encapContentInfo (SEQUENCE)
  // [3]: certificates (SET, optional)
  // [4]: signerInfos (SET)
  const signerInfo = signedDataSequence.value[4];
  if (typeof signerInfo === "string") {
    throw Error(`Raw value found inside of ASN1 node at depth 3, child at 4`);
  }

  const signerInfoSequence = signerInfo.value[0];
  if (typeof signerInfoSequence === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child at 0");
  }

  const signatureOctetString =
    signerInfoSequence.value[signerInfoSequence.value.length - 1];
  if (typeof signatureOctetString === "string") {
    throw Error(
      `Raw value found inside of ASN1 node at depth 5, child ${
        signerInfoSequence.value.length - 1
      }`
    );
  }

  const signatureBytes = signatureOctetString.value;
  if (typeof signatureBytes !== "string") {
    throw Error(`Object value found inside of ASN1 node at depth 6`);
  }

  return signatureBytes;
};

export const signedDataGroupHashesFromASN1DER = (
  input: forge.asn1.Asn1
): string => {
  const signedDataSequence = signedDataSequenceFromASN1DER(input);

  // The SignedData SEQUENCE contains several children:
  // [0]: version (INTEGER)
  // [1]: digestAlgorithms (SET)
  // [2]: encapContentInfo (SEQUENCE)
  // [3]: certificates (SET, optional)
  // [4]: signerInfos (SET)
  const encapContentInfoSequence = signedDataSequence.value[2];
  if (typeof encapContentInfoSequence === "string") {
    throw new Error(
      "EncapsulatedContentInfo SEQUENCE not found at depth 3, child 3"
    );
  }

  // The EncapsulatedContentInfo SEQUENCE contains:
  // [0]: eContentType (OID)
  // [1]: eContent (OCTET STRING, wrapped in a context-specific tag [0])
  const eContentWrapper = encapContentInfoSequence.value[1];
  if (typeof eContentWrapper === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child 1");
  }

  // Unwrap the eContent from its context-specific tag [0] to get the OCTET STRING.
  const eContentOctetStringNode = eContentWrapper.value[0];
  if (typeof eContentOctetStringNode === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child 1");
  }

  const eContentOctetString = eContentOctetStringNode.value;
  if (typeof eContentOctetString !== "string") {
    throw Error(`Object value found inside of ASN1 node at depth 5`);
  }

  return eContentOctetString;
};

const signedAttributesWrapperFromASN1DER = (
  input: forge.asn1.Asn1
): forge.asn1.Asn1 => {
  const signedDataSequence = signedDataSequenceFromASN1DER(input);

  // Inside SignedData, find the signerInfos SET
  // The SignedData SEQUENCE contains several children:
  // [0]: version (INTEGER)
  // [1]: digestAlgorithms (SET)
  // [2]: encapContentInfo (SEQUENCE)
  // [3]: certificates (SET, optional)
  // [4]: signerInfos (SET)
  const signerInfosSet = signedDataSequence.value[4];
  if (typeof signerInfosSet === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 3, child at 4");
  }

  // Get the first SignerInfo structure from the SET
  const signerInfoSequence = signerInfosSet.value[0];
  if (typeof signerInfoSequence === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 4, child at 0");
  }

  // Inside SignerInfo, find the signedAttrs (Signed Attributes)
  // The SignerInfo SEQUENCE contains:
  // [0]: version (INTEGER)
  // [1]: sid (SignerIdentifier)
  // [2]: digestAlgorithm
  // [3]: signedAttrs (CONTEXT-SPECIFIC [0], optional)
  // [4]: signatureAlgorithm
  // [5]: signature
  const signedAttrsWrapper = signerInfoSequence.value[3];
  if (typeof signedAttrsWrapper === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 5, child at 3");
  }

  return signedAttrsWrapper;
};

const signedDataSequenceFromASN1DER = (
  input: forge.asn1.Asn1
): forge.asn1.Asn1 => {
  const pkcs7Message = input.value[0];
  if (typeof pkcs7Message === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 0, child 0");
  }

  // Navigate from the top-level ContentInfo to the SignedData structure
  // The top-level object is a SEQUENCE representing ContentInfo. Its value is an array of its children.
  // Child [0] is the OID (1.2.840.113549.1.7.2 for signedData).
  // Child [1] is the content, which is context-specific and acts as a wrapper.
  const signedDataWrapper = pkcs7Message.value[1];
  if (typeof signedDataWrapper === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 1, child 1");
  }

  // Signed-data object
  const signedDataSequence = signedDataWrapper.value[0];
  if (typeof signedDataSequence === "string") {
    throw Error("Raw value found inside of ASN1 node at depth 2, child 0");
  }

  return signedDataSequence;
};

const bytesToUppercaseHex = (bytesString: string) =>
  forge.util.bytesToHex(bytesString).toUpperCase();

const consoleLogIfNeeed = (line: string, shouldLog: boolean) => {
  if (shouldLog) {
    // eslint-disable-next-line no-console
    console.log(line);
  }
};

const commonFailureHandling = (
  reason: string,
  shouldLog: boolean
): Either<string, never> => {
  if (shouldLog) {
    // eslint-disable-next-line no-console
    console.warn(reason);
  }
  return left(reason);
};

const getCSCAFolderAbsolutePath = () => {
  const workingDirectory = cwd();
  return path.join(workingDirectory, "assets", "send", "aar", "csca");
};
