import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingActions from './BookingActions';
import '@testing-library/jest-dom';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('@/lib/api', () => ({
    api: {
        post: jest.fn(),
    },
}));

const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock window.confirm
const originalConfirm = window.confirm;
beforeAll(() => {
    window.confirm = jest.fn(() => true);
});
afterAll(() => {
    window.confirm = originalConfirm;
});

const mockEvent = {
    id: '123',
    title: 'Test Event',
    description: 'Desc',
    startsAt: new Date().toISOString(),
    location: 'Test Loc',
    capacity: 10,
    filled_participants: 0,
    status: 'PUBLISHED',
};

describe('BookingActions Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Login button when not authenticated', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });

        render(<BookingActions event={mockEvent} />);

        expect(screen.getByText('Login to Reserve')).toBeInTheDocument();
        expect(screen.queryByText('Reserve Your Seat')).not.toBeInTheDocument();
    });

    it('shows Reserve button when authenticated and event not full', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } });

        render(<BookingActions event={mockEvent} />);

        expect(screen.getByText('Reserve Your Seat')).toBeInTheDocument();
    });

    it('shows Event Full when capacity is reached', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } });
        const fullEvent = { ...mockEvent, filled_participants: 10, capacity: 10 };

        render(<BookingActions event={fullEvent} />);

        expect(screen.getByText('Event Full')).toBeDisabled();
    });

    it('calls API and shows success on reservation', async () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } });
        (api.post as jest.Mock).mockResolvedValue({});

        render(<BookingActions event={mockEvent} />);

        const reserveBtn = screen.getByText('Reserve Your Seat');
        fireEvent.click(reserveBtn);

        expect(window.confirm).toHaveBeenCalled();

        // processing state
        expect(screen.getByText('Processing...')).toBeInTheDocument();

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/reservations', { eventId: '123' });
            expect(screen.getByText(/Reservation successful/i)).toBeInTheDocument();
        });
    });

    it('shows error message on API failure', async () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } });
        const errorMsg = 'Already reserved';
        (api.post as jest.Mock).mockRejectedValue({
            response: { data: { message: errorMsg } }
        });

        render(<BookingActions event={mockEvent} />);

        const reserveBtn = screen.getByText('Reserve Your Seat');
        fireEvent.click(reserveBtn);

        await waitFor(() => {
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });
    });
});
