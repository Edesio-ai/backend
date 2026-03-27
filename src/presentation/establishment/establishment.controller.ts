import { Controller, Get, Req, UseFilters, UseGuards } from "@nestjs/common";
import { GetEstablishmentsStatsUseCase } from '../../application/establishment/get-establishment-stats.use-case';
import { Roles } from "../auth/decorator/role.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { User } from "src/domain/auth/auth.type";
import { EstablishmentErrorFilter } from "../filters/establishment.filter";
import { TeacherFilter } from "../filters/teacher.filter";


@Controller('establishment')
export class EstablishmentController {
    constructor(
        private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('establishment')
    @Get('stats')
    @UseFilters(EstablishmentErrorFilter, TeacherFilter)
    async getEstablishmentStats(@Req() req: Request & { user: User }): Promise<any> {
        const { user } = req;
        return await this.getEstablishmentsStatsUseCase.execute(user.id);
    }
}