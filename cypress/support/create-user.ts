// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";
import { createUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";

installGlobals();

async function createAndLogin(
  email: string,
  firstName: string,
  lastName: string,
  telephone: string
) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  if (!firstName) {
    throw new Error("first name is required");
  }

  if (!lastName) {
    throw new Error("last name is required");
  }

  if (!telephone) {
    throw new Error("telephone is required");
  }

  const user = await createUser(
    email,
    firstName,
    lastName,
    telephone,
    "myreallystrongpassword"
  );

  const response = await createUserSession({
    request: new Request("test://test"),
    userId: user.id,
    remember: false,
    redirectTo: "/",
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim()
  );
}

createAndLogin(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  process.argv[5]
);
