import { createRoute } from "honox/factory";
import profileJson from "../../data/profile.json";
import servicesJson from "../../data/services.json";
import type { ProfileSocials } from "../types/profile";
import type { ServiceInfo } from "../types/services";
import ServicesContent from "../islands/ServicesContent";

const typedProfile = profileJson as { social: ProfileSocials };
const typedServices = servicesJson.services as ServiceInfo;

export default createRoute(async (c) => {
  return c.render(
    <>
      <ServicesContent profile={typedProfile} services={typedServices} />
    </>,
  );
});
