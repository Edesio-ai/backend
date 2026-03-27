import { EstablishmentSupabaseRepository } from "./establishment-supabase.repository";
import { EstablishmentCreationFailedError, EstablishmentNotFoundError } from "../../../../domain/establishment/error";

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

    it("should create establishment when insert succeeds", async () => {
        fixtures.whenCreateSupabaseReturnsData();

        const result = await fixtures.whenCreateEstablishment();

        fixtures.thenCreateQueryBuiltWithExpectedArguments();
        fixtures.thenReturnExpectedCreatedEstablishment(result);
    });

    it("should throw EstablishmentCreationFailedError when insert fails", async () => {
        fixtures.whenCreateSupabaseReturnsError();

        const promise = fixtures.whenCreateEstablishment();

        await fixtures.thenThrowCreationFailed(promise);
        fixtures.thenCreateQueryBuiltWithExpectedArguments();
    });
});

class Fixtures {
    public readonly userId = "user-1";
    public readonly establishment = {
        id: "est-1",
        name: "Edesio Academy",
        supabase_user_id: this.userId,
    };
    public readonly createBody = {
        supabaseUserId: "user-2",
        name: "Edesio New",
        email: "new@edesio.io",
    };
    public readonly createdEstablishment = {
        id: "est-2",
        supabase_user_id: this.createBody.supabaseUserId,
        name: this.createBody.name,
        email: this.createBody.email,
    };

    private readonly singleMock = jest.fn();
    private readonly eqMock = jest.fn(() => ({ single: this.singleMock }));
    private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));

    private readonly createSingleMock = jest.fn();
    private readonly createSelectMock = jest.fn(() => ({ single: this.createSingleMock }));
    private readonly insertMock = jest.fn(() => ({ select: this.createSelectMock }));

    private readonly fromMock = jest.fn((table: string) => {
        if (table === "establishment") {
            return {
                select: this.selectMock,
                insert: this.insertMock,
            };
        }
        return {};
    });

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

    whenCreateEstablishment() {
        return this.repository.createEstablishment(
            this.createBody.supabaseUserId,
            this.createBody.name,
            this.createBody.email,
        );
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

    whenCreateSupabaseReturnsData() {
        this.createSingleMock.mockResolvedValue({
            data: this.createdEstablishment,
            error: null,
        });
    }

    whenCreateSupabaseReturnsError() {
        this.createSingleMock.mockResolvedValue({
            data: null,
            error: { message: "duplicate key value violates unique constraint" },
        });
    }

    async thenThrowNotFound(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(EstablishmentNotFoundError);
    }

    async thenThrowCreationFailed(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(EstablishmentCreationFailedError);
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

    thenCreateQueryBuiltWithExpectedArguments() {
        expect(this.fromMock).toHaveBeenCalledWith("establishment");
        expect(this.insertMock).toHaveBeenCalledWith({
            supabase_user_id: this.createBody.supabaseUserId,
            name: this.createBody.name,
            email: this.createBody.email,
        });
        expect(this.createSelectMock).toHaveBeenCalled();
        expect(this.createSingleMock).toHaveBeenCalledTimes(1);
    }

    thenReturnExpectedCreatedEstablishment(result: any) {
        expect(result).toEqual(this.createdEstablishment);
    }
}