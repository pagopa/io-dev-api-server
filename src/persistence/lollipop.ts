import { AssertionRef } from "../../generated/definitions/backend/AssertionRef"
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM } from "../routers/public"

let lollipop_assertion_ref: AssertionRef | undefined = undefined


export function getAssertionRef(){
    return lollipop_assertion_ref
}

export function setAssertionRef(key:string | undefined){
    lollipop_assertion_ref = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${key}` as AssertionRef
}




