import { Outlet } from 'react-router';
import SignUpModal from '../features/auth/components/SignUpModal';

const RootLayout = () => (
    <>
        <Outlet />
        <SignUpModal />
    </>
);

export default RootLayout;
