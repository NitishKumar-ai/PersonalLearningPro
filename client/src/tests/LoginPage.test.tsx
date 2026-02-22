import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
    it('renders without crashing', () => {
        render(<LoginPage />);
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('updates email on input change', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email address/i);

        await user.type(emailInput, 'test@example.com');
        expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password on input change', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(passwordInput, 'password123');
        expect(passwordInput).toHaveValue('password123');
    });

    it('shows error for invalid email', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const submitBtn = screen.getByRole('button', { name: /login/i });

        await user.type(emailInput, 'testexample');
        await user.click(submitBtn);

        expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    });

    it('shows error for short password', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitBtn = screen.getByRole('button', { name: /login/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, '123');
        await user.click(submitBtn);

        expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it('calls onSubmit with correct credentials', async () => {
        const user = userEvent.setup();
        const handleSubmit = vi.fn();
        render(<LoginPage onSubmit={handleSubmit} />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitBtn = screen.getByRole('button', { name: /login/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });
});
