import { Controller, Body, Get, Post, Delete, Param, NotFoundException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import { PublicUser, User } from "./users.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Find all users' })
    @ApiResponse({ status: 200, description: 'List of users', type: [PublicUser] })
    async findAll(): Promise<PublicUser[]> {
        const users = await this.usersService.findAll();
        return users.map(({ passwordHash, ...secureUser }) => secureUser); // Remove passwordHash from each use
    }

    @Get(':username')
    @ApiOperation({ summary: 'Find a user given username' })
    @ApiResponse({ status: 200, description: 'Matching user', type: PublicUser })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'username', description: 'Username of the user to find' })
    async findByUsername(@Param('username') username: string): Promise<PublicUser | null> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { passwordHash, ...secureUser } = user; // Remove passwordHash from each use
        return secureUser;
    }

    @Post()
    @ApiOperation({ summary: 'Create a user' })
    @ApiResponse({ status: 201, description: 'The user has been created', type: PublicUser })
    @ApiResponse({ status: 409, description: 'The user already exists' })
    @ApiBody({ description: 'Fields to input', type: PublicUser })
    async create(@Body() userData: Omit<User, 'userID' | 'passwordHash'> & { password: string }): Promise<PublicUser> {
        try {
            const user = await this.usersService.create(userData.username, userData.password);
            const { passwordHash, ...secureUser } = user;
            return secureUser;
        } catch {
            throw new ConflictException('User already exists');
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'Authenticate user and return JWT token' })
    @ApiResponse({ status: 200, description: 'JWT token + user info' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() body: { username: string; password: string }) {
        const user = await this.authService.validateUser(body.username, body.password);
        const token = await this.authService.login(user);
        return token;
    }

    @Delete(':userID')
    @ApiOperation({ summary: 'Delete a user given userID' })
    @ApiResponse({ status: 204, description: 'User deleted' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'userID', description: 'ID of the user to delete' })
    async delete(@Param('userID') userID: string): Promise<void> {
        const user = await this.usersService.findByID(Number(userID));
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.usersService.delete(Number(userID));
    }
}