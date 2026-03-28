import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { BillingError } from "../../domain/billing/error";

export class BillingErrorFilter implements ExceptionFilter {
    catch(exception: BillingError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        res.status(exception.httpStatus).json({
            code: exception.code,
            message: exception.message,
        });
    }
}