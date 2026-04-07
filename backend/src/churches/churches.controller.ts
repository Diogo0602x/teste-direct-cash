import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ChurchesService } from "./churches.service";
import { CreateChurchDto } from "./dto/create-church.dto";
import { UpdateChurchDto } from "./dto/update-church.dto";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { CreateEventDto } from "./dto/create-event.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedRequest, PaginationParams } from "../types";

@Controller("churches")
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateChurchDto, @Request() req: AuthenticatedRequest) {
    return this.churchesService.create(dto, req.user.sub);
  }

  @Get()
  findAll(@Query("page") page = "1", @Query("limit") limit = "10") {
    const params: PaginationParams = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
    };
    return this.churchesService.findAll(params);
  }

  @Get("lookup-cnpj/:cnpj")
  @UseGuards(JwtAuthGuard)
  lookupCnpj(@Param("cnpj") cnpj: string) {
    return this.churchesService.lookupCnpj(cnpj);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.churchesService.findById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateChurchDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.update(id, dto, req.user.sub);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.churchesService.remove(id, req.user.sub);
  }

  @Post(":id/join")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  requestJoin(@Param("id") churchId: string, @Request() req: AuthenticatedRequest) {
    return this.churchesService.requestJoin(churchId, req.user.sub);
  }

  @Get(":id/members")
  @UseGuards(JwtAuthGuard)
  getMembers(
    @Param("id") churchId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const params: PaginationParams = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
    };
    return this.churchesService.getMembers(churchId, params);
  }

  @Get(":id/requests")
  @UseGuards(JwtAuthGuard)
  getPendingRequests(@Param("id") churchId: string, @Request() req: AuthenticatedRequest) {
    return this.churchesService.getPendingRequests(churchId, req.user.sub);
  }

  @Patch(":id/members/:userId/approve")
  @UseGuards(JwtAuthGuard)
  approveMember(
    @Param("id") churchId: string,
    @Param("userId") userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.approveMember(churchId, userId, req.user.sub);
  }

  @Patch(":id/members/:userId/reject")
  @UseGuards(JwtAuthGuard)
  rejectMember(
    @Param("id") churchId: string,
    @Param("userId") userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.rejectMember(churchId, userId, req.user.sub);
  }

  @Patch(":id/members/:userId/role")
  @UseGuards(JwtAuthGuard)
  updateMemberRole(
    @Param("id") churchId: string,
    @Param("userId") userId: string,
    @Body("role") role: "ADMIN" | "MEMBER",
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.updateMemberRole(churchId, userId, role, req.user.sub);
  }

  @Delete(":id/members/:userId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param("id") churchId: string,
    @Param("userId") userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.removeMember(churchId, userId, req.user.sub);
  }

  @Post(":id/add-admin")
  @UseGuards(JwtAuthGuard)
  addAdmin(
    @Param("id") churchId: string,
    @Body("email") email: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.addAdminByEmail(churchId, email, req.user.sub);
  }

  @Get(":id/schedules")
  getSchedules(@Param("id") churchId: string) {
    return this.churchesService.getSchedules(churchId);
  }

  @Post(":id/schedules")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createSchedule(
    @Param("id") churchId: string,
    @Body() dto: CreateScheduleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.createSchedule(churchId, dto, req.user.sub);
  }

  @Patch(":id/schedules/:scheduleId")
  @UseGuards(JwtAuthGuard)
  updateSchedule(
    @Param("id") churchId: string,
    @Param("scheduleId") scheduleId: string,
    @Body() dto: Partial<CreateScheduleDto>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.updateSchedule(churchId, scheduleId, dto, req.user.sub);
  }

  @Delete(":id/schedules/:scheduleId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSchedule(
    @Param("id") churchId: string,
    @Param("scheduleId") scheduleId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.deleteSchedule(churchId, scheduleId, req.user.sub);
  }

  @Get(":id/events")
  getEvents(@Param("id") churchId: string) {
    return this.churchesService.getEvents(churchId);
  }

  @Post(":id/events")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createEvent(
    @Param("id") churchId: string,
    @Body() dto: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.createEvent(churchId, dto, req.user.sub);
  }

  @Patch(":id/events/:eventId")
  @UseGuards(JwtAuthGuard)
  updateEvent(
    @Param("id") churchId: string,
    @Param("eventId") eventId: string,
    @Body() dto: Partial<CreateEventDto>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.updateEvent(churchId, eventId, dto, req.user.sub);
  }

  @Delete(":id/events/:eventId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEvent(
    @Param("id") churchId: string,
    @Param("eventId") eventId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.churchesService.deleteEvent(churchId, eventId, req.user.sub);
  }
}
