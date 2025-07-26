import { createRoute } from "honox/factory";
import profileDataForRoute from "../../data/profile.json";
import aboutJsonData from "../../data/about.json";
import routeJsonData from "../../data/routes.json";
import staffData from "../../data/staff.json";
import type { AboutData } from "../types/about";
import type { ProfileData } from "../types/profile";
import type { StaffData } from "../types/staff";
import type { RoutesJson } from "../types/routes";
import AboutContent from "../islands/AboutContent";
import StaffList from "../islands/StaffList";

const typedAboutData: AboutData = aboutJsonData as AboutData;
const typedProfileData: ProfileData = profileDataForRoute as ProfileData;
const typedStaffData = staffData as StaffData;
const typedRouteData = routeJsonData as RoutesJson;

export default createRoute(async (c) => {
  return c.render(
    <>
      <section class="mt-8 space-y-6">
        <StaffList staffMembers={typedStaffData.staff} />
      </section>
      <AboutContent
        aboutData={typedAboutData}
        profile={typedProfileData}
        routesData={typedRouteData}
      />
    </>,
  );
});
