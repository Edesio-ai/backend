import { Inject } from "@nestjs/common";
import { SUPABASE_ADMIN } from "../supabase.module";
import { FetchSubscriptionError } from "src/domain/subscription/error";

export class SubscriptionSupabaseRepository implements SubscriptionSupabaseRepository {
    constructor(
        @Inject(SUPABASE_ADMIN)
        private readonly supabase: any,
    ) { }

    async getUserSubscription(userId: string): Promise<any> {
        const { data, error } = await this.supabase
        .from("subscription")
        .select("*")
        .eq("suscriber_id", userId);
        
        if (error) {
            const message = error instanceof Error ? error.message : "";
            throw new FetchSubscriptionError(message);
        }
        return data[0] || null;
    }
}