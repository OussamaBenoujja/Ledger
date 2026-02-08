import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import '@testing-library/jest-dom';

// Mock mocks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/dashboard'),
}));

const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('Sidebar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user details and standard links', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', role: 'USER' },
            logout: mockLogout,
        });

        render(<Sidebar />);

        expect(screen.getByText('Ledger')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument(); // Lowercase role
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Browse Events')).toBeInTheDocument();

        // User should NOT see Admin Panel
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('renders Admin Panel link for ADMIN role', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'admin@example.com', role: 'ADMIN' },
            logout: mockLogout,
        });

        render(<Sidebar />);

        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('calls logout when Sign Out button is clicked', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', role: 'USER' },
            logout: mockLogout,
        });

        render(<Sidebar />);

        const logoutBtn = screen.getByText('Sign Out');
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});
