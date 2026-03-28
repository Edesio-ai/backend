import { Controller, Get, Req, UseFilters, UseGuards } from "@nestjs/common";
import { GetSubscriptionStatusUseCase } from "../../application/billing/get-subscription-status.use-case";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../../domain/auth/auth.type";
import { BillingErrorFilter } from "../filters/billing.filter";

@Controller('billing')
export class BillingController {
    constructor(
        private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseFilters(BillingErrorFilter)
    @Get('subscription-status')
    async getSubscriptionStatus(@Req() req: Request & { user: User }): Promise<any> {
        const { user } = req;
        return this.getSubscriptionStatusUseCase.execute(user);
    }
}   