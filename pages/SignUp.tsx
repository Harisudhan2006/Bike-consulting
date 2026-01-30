import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const { email, password, confirmPassword, ...additionalData } = formData;
            await signup(email, password, additionalData);
            navigate('/');
        } catch (err: any) {
            console.error('Signup error:', err);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('Email is already registered');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak');
                    break;
                default:
                    setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="auth-container bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md text-white">
                <h2 className="text-3xl font-black text-center mb-6">Create Account</h2>
                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-center border border-red-500/30">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:border-purple-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:border-purple-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" class="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:border-purple-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword" class="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:border-purple-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center mt-6 text-gray-400">
                    Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
