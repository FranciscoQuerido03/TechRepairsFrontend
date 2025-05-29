import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface AuthContextProps {
	accessToken: string | null;
	refreshToken: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	faceIDLogin: (formData: FormData) => Promise<void>;
	isStaff: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

	const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
	const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
	const [isStaff, setIsStaff] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		const refreshInterceptor = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;

				if (error.response.status === 401 && error.request.statusText === 'Unauthorized') {
					try {
						const response = await axios.post(import.meta.env.VITE_APP_BACKEND + 'login/refresh/', {
							refresh: refreshToken,
						}, {
							headers: {
								'Content-Type': 'application/json',
							}
						});

						const newAccessToken = response.data.access;
						setAccessToken(newAccessToken);

						const newRequest = {
							...originalRequest,
							headers: {
								...originalRequest.headers,
								Authorization: `Bearer ${newAccessToken}`
							}
						};

						navigate(0);
						return axios(newRequest);
					} catch (err) {
						console.error("Erro ao tentar renovar o token:", err);
						setAccessToken(null);
						setRefreshToken(null);
						localStorage.removeItem('isStaff');
						navigate('/');
					}
				}

				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.response.eject(refreshInterceptor);
		};
	}, [refreshToken, navigate, accessToken]);

	const login = async (email: string, password: string) => {
		try {
			const response = await axios.post(import.meta.env.VITE_APP_BACKEND + 'login/',
				{ email, password },
				{
					headers: {
						'Content-Type': 'application/json',
					}
				}
			);

			console.log('Login response:', response);

			if (response.status === 200) {
				const data = await response.data;
				setAccessToken(data.access);
				setRefreshToken(data.refresh);
				localStorage.setItem('accessToken', data.access);
				localStorage.setItem('refreshToken', data.refresh);
				localStorage.setItem('userId', data.user_id);

				if (data.is_staff === true) {
					navigate('/admin');
					setIsStaff(true);
					localStorage.setItem('isStaff', 'true');
				} else {
					setIsStaff(false);
					localStorage.setItem('isStaff', 'false');
					navigate('/');
				}
			} else {
				const errorData = response.data;
				throw new Error(errorData.error || 'Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	};

	const logout = () => {
		navigate('/');
		setAccessToken(null);
		setRefreshToken(null);
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('isStaff');
		localStorage.removeItem('userId');
	};

	const faceIDLogin = async (formData: FormData) => {
		try {
			const response = await axios.post(import.meta.env.VITE_APP_BACKEND + 'login/faceid/', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				}
			});

			if (response.status === 200) {
				const data = await response.data;
				setAccessToken(data.access);
				setRefreshToken(data.refresh);
				localStorage.setItem('accessToken', data.access);
				localStorage.setItem('refreshToken', data.refresh);
				localStorage.setItem('userId', data.user_id);

				if (data.is_staff === true) {
					navigate('/admin');
					setIsStaff(true);
					localStorage.setItem('isStaff', 'true');
				} else {
					setIsStaff(false);
					localStorage.setItem('isStaff', 'false');
					navigate('/');
				}
			} else {
				const errorData = response.data;
				throw new Error(errorData.error || 'FaceID login failed');
			}
		} catch (error) {
			console.error('FaceID login error:', error);
			throw error;
		}
	}

	useEffect(() => {
		setIsStaff(localStorage.getItem('isStaff') === 'true');
	}, []);

	return (
		<AuthContext.Provider value={{ accessToken, refreshToken, login, faceIDLogin, logout, isStaff }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export default AuthContext;
