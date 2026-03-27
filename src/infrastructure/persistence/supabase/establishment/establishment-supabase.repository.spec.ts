import { EstablishmentSupabaseRepository } from "./establishment-supabase.repository";
import { EstablishmentNotFoundError } from "../../../../domain/establishment/error";

describe("EstablishmentSupabaseRepository", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should return establishment when query succeeds", async () => {
        fixtures.whenSupabaseReturnsData();

        const result = await fixtures.whenGetEstablishmentByUserId();

        fixtures.thenQueryBuiltWithExpectedArguments();
        fixtures.thenReturnExpectedEstablishment(result);
    });

    it("should throw EstablishmentNotFoundError when query fails", async () => {
        fixtures.whenSupabaseReturnsError();

        const promise = fixtures.whenGetEstablishmentByUserId();

        await fixtures.thenThrowNotFound(promise);
        fixtures.thenQueryBuiltWithExpectedArguments();
    });
});

class Fixtures {
    public readonly userId = "user-1";
    public readonly establishment = {
        id: "est-1",
        name: "Edesio Academy",
        supabase_user_id: this.userId,
    };

    private readonly singleMock = jest.fn();
    private readonly eqMock = jest.fn(() => ({ single: this.singleMock }));
    private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));
    private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

    public readonly repository: EstablishmentSupabaseRepository;

    constructor() {
        const supabaseMock = {
            from: this.fromMock,
        };
        this.repository = new EstablishmentSupabaseRepository(supabaseMock as any);
    }

    whenGetEstablishmentByUserId() {
        return this.repository.getEstablishmentByUserId(this.userId);
    }

    whenSupabaseReturnsData() {
        this.singleMock.mockResolvedValue({
            data: this.establishment,
            error: null,
        });
    }

    whenSupabaseReturnsError() {
        this.singleMock.mockResolvedValue({
            data: null,
            error: { message: "no rows" },
        });
    }

    async thenThrowNotFound(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(EstablishmentNotFoundError);
    }

    thenQueryBuiltWithExpectedArguments() {
        expect(this.fromMock).toHaveBeenCalledWith("establishment");
        expect(this.selectMock).toHaveBeenCalledWith("*");
        expect(this.eqMock).toHaveBeenCalledWith("supabase_user_id", this.userId);
        expect(this.singleMock).toHaveBeenCalledTimes(1);
    }

    thenReturnExpectedEstablishment(result: any) {
        expect(result).toEqual(this.establishment);
    }
}