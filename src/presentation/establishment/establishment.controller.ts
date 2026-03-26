import { Controller, Get } from "@nestjs/common";
import { GetEstablishmentsStatsUseCase } from '../../application/establishment/getEstablishmentStats.use-case';

@Controller('establishment')
export class EstablishmentController {
    constructor(
        private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase,
    ) {}

    @Get('stats')
    async getEstablishmentStats(): Promise<any> {
        this.getEstablishmentsStatsUseCase.execute();
        return {
            message: 'Establishment fetched successfully',
        };
    }
}