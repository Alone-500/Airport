import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store/store';
import { ToastViewport } from './components/ui/Toaster';
import { PublicLayout } from './components/layout/PublicLayout';
import Home from './pages/public/Home';
import { RouteSkeleton } from './components/ui/RouteSkeleton';

const Search = lazy(() => import('./pages/public/Search'));
const FlightDetails = lazy(() => import('./pages/public/FlightDetails'));
const Booking = lazy(() => import('./pages/public/Booking'));
const ManageBooking = lazy(() => import('./pages/public/ManageBooking'));
const CheckIn = lazy(() => import('./pages/public/CheckIn'));
const FlightStatus = lazy(() => import('./pages/public/FlightStatus'));
const Destinations = lazy(() => import('./pages/public/Destinations'));
const DestinationDetail = lazy(() => import('./pages/public/DestinationDetail'));
const Offers = lazy(() => import('./pages/public/Offers'));
const Loyalty = lazy(() => import('./pages/public/Loyalty'));
const Experience = lazy(() => import('./pages/public/Experience'));
const ExperienceDetail = lazy(() => import('./pages/public/ExperienceDetail'));
const CabinPage = lazy(() => import('./pages/public/CabinPage'));
const TravelInfo = lazy(() => import('./pages/public/TravelInfo'));
const TravelSectionPage = lazy(() => import('./pages/public/TravelSectionPage'));
const Airports = lazy(() => import('./pages/public/Airports'));
const AirportDetail = lazy(() => import('./pages/public/AirportDetail'));
const Help = lazy(() => import('./pages/public/Help'));
const About = lazy(() => import('./pages/public/About'));
const Fleet = lazy(() => import('./pages/public/Fleet'));
const FleetDetail = lazy(() => import('./pages/public/FleetDetail'));
const Newsroom = lazy(() => import('./pages/public/Newsroom'));
const Careers = lazy(() => import('./pages/public/Careers'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Story = lazy(() => import('./pages/public/Story'));
const SignIn = lazy(() => import('./pages/public/SignIn'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountOverview = lazy(() => import('./pages/account/Overview'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));
const AccountTrips = lazy(() => import('./pages/account/Trips'));
const AccountBookings = lazy(() => import('./pages/account/Bookings'));
const AccountRewards = lazy(() => import('./pages/account/Rewards'));
const AccountPreferences = lazy(() => import('./pages/account/Preferences'));
const AccountDocuments = lazy(() => import('./pages/account/Documents'));
const AccountPayment = lazy(() => import('./pages/account/Payment'));
const AccountNotifications = lazy(() => import('./pages/account/Notifications'));
const AccountSecurity = lazy(() => import('./pages/account/Security'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export default function App() {
  return (
    <StoreProvider>
      <Suspense fallback={<RouteSkeleton />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="book" element={<Search />} />
            <Route path="search" element={<Search />} />
            <Route path="flight-details" element={<FlightDetails />} />
            <Route path="booking" element={<Booking />} />
            <Route path="confirmation/:ref" element={<Navigate to="/manage-booking" replace />} />
            <Route path="manage-booking" element={<ManageBooking />} />
            <Route path="check-in" element={<CheckIn />} />
            <Route path="check-in/:ref" element={<CheckIn />} />
            <Route path="flight-status" element={<FlightStatus />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:slug" element={<DestinationDetail />} />
            <Route path="offers" element={<Offers />} />
            <Route path="loyalty" element={<Loyalty />} />
            <Route path="experience" element={<Experience />} />
            <Route path="experience/:slug" element={<ExperienceDetail />} />
            <Route path="cabins" element={<Navigate to="/experience" replace />} />
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
          </Route>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="create-account" element={<SignIn />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </StoreProvider>
  );
}
