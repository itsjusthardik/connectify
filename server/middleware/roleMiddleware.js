/**
 * Role middleware - Enforce role-based access control
 * Creates middleware factories to check if user has specific role(s)
 */
import {
  CONSUMER_ROLE,
  CONTENT_CREATOR_ROLE,
  GRAPHIC_DESIGNER_ROLE,
  VIDEO_EDITOR_ROLE,
  isRole
} from '../utils/userMetadata.js';

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.some((allowedRole) => isRole(userRole, allowedRole))) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

// Specific role checkers
const isCreator = requireRole(CONTENT_CREATOR_ROLE);
const isEditor = requireRole(VIDEO_EDITOR_ROLE);
const isDesigner = requireRole(GRAPHIC_DESIGNER_ROLE);
const isConsumer = requireRole(CONSUMER_ROLE);
const isTalent = requireRole(VIDEO_EDITOR_ROLE, GRAPHIC_DESIGNER_ROLE);

export {
  requireRole,
  isCreator,
  isEditor,
  isDesigner,
  isConsumer,
  isTalent
};
