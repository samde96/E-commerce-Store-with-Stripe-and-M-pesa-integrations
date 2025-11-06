import {  NextResponse } from "next/server";
 
export async function POST(request) {
  const data = await request.json();
 
  if (!data.Body.stkCallback.CallbackMetadata) {
    //for failed transactions
    console.log(data.Body.stkCallback.ResultDesc);
    return NextResponse.json("ok saf");
  }
 
  //lets extract the values from the callback metadata
 
  const body = data.Body.stkCallback.CallbackMetadata
  const amountObj = body.Item.find(obj => obj.Name === "Amount");
  const amount = amountObj.Value;
 
  //mpesa code
  const codeObj = body.Item.find(
    obj => obj.Name === "MpesaReceiptNumber"
  );
  const mpesaCode = codeObj.Value;
 
  //phone number - in recent implimentations, it is hashed.
  const phoneNumberObj = body.Item.find(
    obj => obj.Name === "PhoneNumber"
  );
  const phoneNumber = phoneNumberObj.Value.toString();
 
  try {
    //complete your logic - Eg saving transaction to db
 
    console.log({amount, mpesaCode, phoneNumber})
    
    return NextResponse.json("ok", { status: 200 });
  } catch (error) {
    return NextResponse.json("ok");
  }
}