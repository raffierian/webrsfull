import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

export const getMenusByRole = async (req, res) => {
    try {
        const { role } = req.params;

        // Find role by name
        const roleRecord = await prisma.role.findUnique({
            where: { name: role }
        });

        if (!roleRecord) {
            return errorResponse(res, 'Role not found', 404);
        }

        const roleMenu = await prisma.roleMenu.findUnique({
            where: { roleId: roleRecord.id },
        });

        successResponse(res, roleMenu ? roleMenu.menus : [], 'Menus retrieved successfully');
    } catch (error) {
        errorResponse(res, 'Error retrieving menus', 500, error.message);
    }
};

export const updateRoleMenus = async (req, res) => {
    try {
        const { role } = req.params;
        const { menus } = req.body;

        // Find role by name
        const roleRecord = await prisma.role.findUnique({
            where: { name: role }
        });

        if (!roleRecord) {
            return errorResponse(res, 'Role not found', 404);
        }

        // Check for legacy enum role
        const validEnumRoles = ['PATIENT', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'STAFF'];
        const enumRole = validEnumRoles.includes(role) ? role : undefined;

        const roleMenu = await prisma.roleMenu.upsert({
            where: { roleId: roleRecord.id },
            update: { menus },
            create: {
                roleId: roleRecord.id,
                role: enumRole, // Set if valid enum, otherwise undefined/null (if optional)
                menus
            },
        });

        successResponse(res, roleMenu, 'Role menus updated successfully');
    } catch (error) {
        errorResponse(res, 'Error updating role menus', 500, error.message);
    }
};

export const getMyMenus = async (req, res) => {
    try {
        const { role, roleId } = req.user;

        // Super Admin has access to everything by default
        if (role === 'SUPER_ADMIN') {
            return successResponse(res, ['*'], 'Menus retrieved successfully');
        }

        if (!roleId) {
            return successResponse(res, [], 'No role assigned');
        }

        const roleMenu = await prisma.roleMenu.findUnique({
            where: { roleId },
        });

        successResponse(res, roleMenu ? roleMenu.menus : [], 'Menus retrieved successfully');
    } catch (error) {
        errorResponse(res, 'Error retrieving menus', 500, error.message);
    }
};
