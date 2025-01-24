import * as userService from '../services/userService.js';

export const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const auth0Id = req.auth.sub;
      const user = await userService.getUserByAuth0Id(auth0Id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. Insufficient permissions.'
        });
      }

      // Attach user to request object for later use
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user role'
      });
    }
  };
};
