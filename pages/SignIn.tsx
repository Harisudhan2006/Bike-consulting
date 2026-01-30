import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                    setError('No account found with this email or incorrect password');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later.');
                    break;
                default:
                    setError('Failed to log in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="auth-container bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md text-white">
                <h2 className="text-3xl font-black text-center mb-6">Welcome Back</h2>
                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-center border border-red-500/30">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:stroke-teal-500 focus:border-teal-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" class="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-gray-600 rounded px-4 py-2 focus:border-teal-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <p className="text-center mt-6 text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-bold">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
