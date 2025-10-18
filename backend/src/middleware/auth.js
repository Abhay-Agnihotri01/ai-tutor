import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - Invalid auth header format');
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Auth middleware - Token extracted:', token ? 'Yes' : 'No');
    console.log('Auth middleware - Token length:', token?.length || 0);
    console.log('Auth middleware - Token preview:', token?.substring(0, 20) + '...');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('Auth middleware - No valid token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Auth middleware - JWT_SECRET not found');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded, user ID:', decoded.id);
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();
    console.log('Auth middleware - User found:', user ? 'Yes' : 'No');
    console.log('Auth middleware - User active:', user?.isActive);
    
    if (!user) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ message: 'User not found.' });
    }
    
    if (!user.isActive) {
      console.log('Auth middleware - User inactive');
      return res.status(401).json({ message: 'Account inactive.' });
    }

    req.user = user;
    console.log('Auth middleware - Success, user:', { id: user.id, role: user.role });
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};