import { StudentSupabaseRepository } from "./student-supabase.repository";
import { StudentSessionsNotFoundError } from "../../../../domain/teaching/error";

describe("StudentSupabaseRepository", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should return student sessions for session ids", async () => {
        fixtures.whenQueryReturnsData();

        const result = await fixtures.whenGetStudentsSessionsByIds(fixtures.sessionIds);

        fixtures.thenQueryBuiltWithSessionIds(fixtures.sessionIds);
        fixtures.thenReturnExpectedStudentSessions(result);
    });

    it("should use fallback uuid when session ids are empty", async () => {
        fixtures.whenQueryReturnsData();

        await fixtures.whenGetStudentsSessionsByIds([]);

        fixtures.thenQueryBuiltWithFallbackId();
    });

    it("should throw StudentSessionsNotFoundError when query fails", async () => {
        fixtures.whenQueryReturnsError();

        const promise = fixtures.whenGetStudentsSessionsByIds(fixtures.sessionIds);

        await fixtures.thenThrowStudentSessionsNotFound(promise);
    });
});

class Fixtures {
    public readonly sessionIds = ["session-1", "session-2"];
    public readonly fallbackId = "00000000-0000-0000-0000-000000000000";
    public readonly studentSessions = [{ session_id: "session-1", student_id: "student-1" }];

    private readonly inMock = jest.fn();
    private readonly selectMock = jest.fn(() => ({ in: this.inMock }));
    private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

    public readonly repository: StudentSupabaseRepository;

    constructor() {
        const supabaseMock = {
            from: this.fromMock,
        };
        this.repository = new StudentSupabaseRepository(supabaseMock as any);
    }

    whenGetStudentsSessionsByIds(sessionIds: string[]) {
        return this.repository.getStudentsSessionsByIds(sessionIds);
    }

    whenQueryReturnsData() {
        this.inMock.mockResolvedValue({
            data: this.studentSessions,
            error: null,
        });
    }

    whenQueryReturnsError() {
        this.inMock.mockResolvedValue({
            data: null,
            error: { message: "query failed" },
        });
    }

    async thenThrowStudentSessionsNotFound(promise: Promise<unknown>) {
        await expect(promise).rejects.toBeInstanceOf(StudentSessionsNotFoundError);
    }

    thenQueryBuiltWithSessionIds(sessionIds: string[]) {
        expect(this.fromMock).toHaveBeenCalledWith("stutent_sessions");
        expect(this.selectMock).toHaveBeenCalledWith("session_id, student_id");
        expect(this.inMock).toHaveBeenCalledWith("session_id", sessionIds);
    }

    thenQueryBuiltWithFallbackId() {
        expect(this.inMock).toHaveBeenCalledWith("session_id", [this.fallbackId]);
    }

    thenReturnExpectedStudentSessions(result: any) {
        expect(result).toEqual(this.studentSessions);
    }
}