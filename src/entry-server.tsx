import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store/store';
import { PublicLayout } from './components/layout/PublicLayout';
import Home from './pages/public/Home';
import Search from './pages/public/Search';
import FlightDetails from './pages/public/FlightDetails';
import Booking from './pages/public/Booking';
import ManageBooking from './pages/public/ManageBooking';
import CheckIn from './pages/public/CheckIn';
import FlightStatus from './pages/public/FlightStatus';
import Destinations from './pages/public/Destinations';
import DestinationDetail from './pages/public/DestinationDetail';
import Offers from './pages/public/Offers';
import Loyalty from './pages/public/Loyalty';
import Experience from './pages/public/Experience';
import ExperienceDetail from './pages/public/ExperienceDetail';
import CabinPage from './pages/public/CabinPage';
import TravelInfo from './pages/public/TravelInfo';
import TravelSectionPage from './pages/public/TravelSectionPage';
import Airports from './pages/public/Airports';
import AirportDetail from './pages/public/AirportDetail';
import Help from './pages/public/Help';
import About from './pages/public/About';
import Fleet from './pages/public/Fleet';
import FleetDetail from './pages/public/FleetDetail';
import Newsroom from './pages/public/Newsroom';
import Careers from './pages/public/Careers';
import Contact from './pages/public/Contact';
import Story from './pages/public/Story';
import SignIn from './pages/public/SignIn';
import NotFound from './pages/public/NotFound';
import AccountLayout from './pages/account/AccountLayout';
import AccountOverview from './pages/account/Overview';
import AccountProfile from './pages/account/Profile';
import AccountTrips from './pages/account/Trips';
import AccountBookings from './pages/account/Bookings';
import AccountRewards from './pages/account/Rewards';
import AccountPreferences from './pages/account/Preferences';
import AccountDocuments from './pages/account/Documents';
import AccountPayment from './pages/account/Payment';
import AccountNotifications from './pages/account/Notifications';
import AccountSecurity from './pages/account/Security';
import AdminApp from './pages/admin/AdminApp';

export function render(url: string) {
  return renderToString(
    <StoreProvider>
      <StaticRouter location={url}>
        
<Routes>
  <Route element={<PublicLayout />}>
    <Route index element={<Home />} />
    <Route path="book" element={<Search />} />
    <Route path="search" element={<Search />} />
    <Route path="flight-details" element={<FlightDetails />} />
    <Route path="booking" element={<Booking />} />
    <Route path="manage-booking" element={<ManageBooking />} />
    <Route path="check-in" element={<CheckIn />} />
    <Route path="flight-status" element={<FlightStatus />} />
    <Route path="destinations" element={<Destinations />} />
    <Route path="destinations/:slug" element={<DestinationDetail />} />
    <Route path="offers" element={<Offers />} />
    <Route path="loyalty" element={<Loyalty />} />
    <Route path="experience" element={<Experience />} />
    <Route path="experience/:slug" element={<ExperienceDetail />} />
    <Route path="cabins/:slug" element={<CabinPage />} />
    <Route path="travel-information" element={<TravelInfo />} />
    <Route path="travel-information/:slug" element={<TravelSectionPage />} />
    <Route path="airports" element={<Airports />} />
    <Route path="airports/:code" element={<AirportDetail />} />
    <Route path="help" element={<Help />} />
    <Route path="help/:slug" element={<Help />} />
    <Route path="about" element={<About />} />
    <Route path="fleet" element={<Fleet />} />
    <Route path="fleet/:id" element={<FleetDetail />} />
    <Route path="newsroom" element={<Newsroom />} />
    <Route path="careers" element={<Careers />} />
    <Route path="careers/:dept" element={<Careers />} />
    <Route path="contact" element={<Contact />} />
    <Route path="stories/:id" element={<Story />} />
    <Route path="account" element={<AccountLayout />}>
      <Route index element={<AccountOverview />} />
      <Route path="profile" element={<AccountProfile />} />
      <Route path="trips" element={<AccountTrips />} />
      <Route path="bookings" element={<AccountBookings />} />
      <Route path="rewards" element={<AccountRewards />} />
      <Route path="preferences" element={<AccountPreferences />} />
      <Route path="documents" element={<AccountDocuments />} />
      <Route path="payment" element={<AccountPayment />} />
      <Route path="notifications" element={<AccountNotifications />} />
      <Route path="security" element={<AccountSecurity />} />
    </Route>
    <Route path="admin/*" element={<AdminApp />} />
    <Route path="sign-in" element={<SignIn />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
      </StaticRouter>
    </StoreProvider>,
  );
}
