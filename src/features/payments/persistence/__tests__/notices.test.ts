import { faker } from "@faker-js/faker";
import * as O from "fp-ts/lib/Option";
import noticesAPI from "../notices";
import { NoticeListItem } from "../../../../../generated/definitions/pagopa/transactions/NoticeListItem";

describe("Notices API", () => {
  beforeEach(() => {
    const allNotices = noticesAPI.getUserNotices();
    allNotices.forEach(notice => {
      noticesAPI.removeUserNotice(notice.eventId);
    });
  });

  describe("addUserNotice", () => {
    it("should add a notice to the user notices list", () => {
      const mockNotice: NoticeListItem = {
        eventId: faker.datatype.uuid(),
        payeeName: faker.company.name(),
        payeeTaxCode: "12345678901",
        isDebtor: false,
        isPayer: true,
        amount: "100.00",
        noticeDate: new Date().toISOString(),
        isCart: false
      };

      noticesAPI.addUserNotice(mockNotice);
      const notices = noticesAPI.getUserNotices();

      expect(notices).toHaveLength(1);
      expect(notices[0]).toEqual(mockNotice);
    });
  });

  describe("getUserNotices", () => {
    it("should return empty array when no notices exist", () => {
      const notices = noticesAPI.getUserNotices();
      expect(notices).toHaveLength(0);
    });

    it("should return all user notices", () => {
      const mockNotice1: NoticeListItem = {
        eventId: faker.datatype.uuid(),
        payeeName: faker.company.name(),
        payeeTaxCode: "12345678901",
        isDebtor: false,
        isPayer: true,
        amount: "100.00",
        noticeDate: new Date().toISOString(),
        isCart: false
      };

      const mockNotice2: NoticeListItem = {
        eventId: faker.datatype.uuid(),
        payeeName: faker.company.name(),
        payeeTaxCode: "98765432109",
        isDebtor: false,
        isPayer: true,
        amount: "200.00",
        noticeDate: new Date().toISOString(),
        isCart: false
      };

      noticesAPI.addUserNotice(mockNotice1);
      noticesAPI.addUserNotice(mockNotice2);

      const notices = noticesAPI.getUserNotices();
      expect(notices).toHaveLength(2);
      expect(notices).toContainEqual(mockNotice1);
      expect(notices).toContainEqual(mockNotice2);
    });
  });

  describe("getNoticeDetails", () => {
    it("should return None when notice details don't exist", () => {
      const eventId = faker.datatype.uuid();
      const result = noticesAPI.getNoticeDetails(eventId);
      expect(O.isNone(result)).toBe(true);
    });

    it("should return notice details when they exist", () => {
      const eventId = faker.datatype.uuid();
      noticesAPI.generateUserNotice(eventId, 0);
      const result = noticesAPI.getNoticeDetails(eventId);

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toBeDefined();
        expect(result.value.infoNotice).toBeDefined();
        expect(result.value.carts).toBeDefined();
      }
    });
  });

  describe("removeUserNotice", () => {
    it("should remove a notice and its details", () => {
      const eventId = faker.datatype.uuid();
      noticesAPI.generateUserNotice(eventId, 0);

      expect(noticesAPI.getUserNotices()).toHaveLength(1);
      expect(O.isSome(noticesAPI.getNoticeDetails(eventId))).toBe(true);

      noticesAPI.removeUserNotice(eventId);

      expect(noticesAPI.getUserNotices()).toHaveLength(0);
      expect(O.isNone(noticesAPI.getNoticeDetails(eventId))).toBe(true);
    });
  });

  describe("generateUserNotice", () => {
    it("should generate a notice with default values", () => {
      const eventId = faker.datatype.uuid();
      const notice = noticesAPI.generateUserNotice(eventId, 0);

      expect(notice).toBeDefined();
      expect(notice.eventId).toBe(eventId);
      expect(notice.payeeName).toBeDefined();
      expect(notice.payeeTaxCode).toBeDefined();
      expect(notice.amount).toBeDefined();
      expect(notice.noticeDate).toBeDefined();
    });

    it("should generate cart notices when multiple items are present", () => {
      const eventId = faker.datatype.uuid();
      const notice = noticesAPI.generateUserNotice(eventId, 0);

      const details = noticesAPI.getNoticeDetails(eventId);
      expect(O.isSome(details)).toBe(true);

      if (O.isSome(details) && details.value.carts) {
        expect(details.value.carts.length).toBeGreaterThan(0);
        expect(notice.isCart).toBe(details.value.carts.length > 1);
      }
    });
  });
});
