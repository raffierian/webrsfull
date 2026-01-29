import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

export const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' },
        });
        successResponse(res, roles, 'Roles retrieved successfully');
    } catch (error) {
        errorResponse(res, 'Error retrieving roles', 500, error.message);
    }
};

export const createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingRole = await prisma.role.findUnique({
            where: { name },
        });

        if (existingRole) {
            return errorResponse(res, 'Role already exists', 400);
        }

        const role = await prisma.role.create({
            data: {
                name: name.toUpperCase(),
                description,
            },
        });

        successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
        errorResponse(res, 'Error creating role', 500, error.message);
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const role = await prisma.role.update({
            where: { id },
            data: {
                name: name.toUpperCase(),
                description,
            },
        });

        successResponse(res, role, 'Role updated successfully');
    } catch (error) {
        errorResponse(res, 'Error updating role', 500, error.message);
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if role is used by users
        const usersCount = await prisma.user.count({
            where: { roleId: id },
        });

        if (usersCount > 0) {
            return errorResponse(res, 'Cannot delete role because it is assigned to users', 400);
        }

        await prisma.role.delete({
            where: { id },
        });

        successResponse(res, null, 'Role deleted successfully');
    } catch (error) {
        errorResponse(res, 'Error deleting role', 500, error.message);
    }
};
