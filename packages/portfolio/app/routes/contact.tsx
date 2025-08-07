import { createRoute } from "honox/factory";
import ContactContent from "../islands/ContactContent";
import contactDataJson from "../../data/contact.json";
import type { ContactData } from "../types/contact";

const ContactData = contactDataJson as ContactData;

export default createRoute(async (c) => {
  return c.render(
    <>
      <ContactContent way={ContactData.way} />
    </>,
  );
});
