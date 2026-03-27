import { EstablishmentErrorFilter } from "./establishment.filter";
import { EstablishmentCreationFailedError } from "../../domain/establishment/error";

describe("EstablishmentErrorFilter", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should map EstablishmentError to http response", () => {
        const exception = fixtures.givenEstablishmentError();

        fixtures.whenCatch(exception);

        fixtures.thenStatusCalledWith(exception.httpStatus);
        fixtures.thenJsonCalledWith({
            code: exception.code,
            message: exception.message,
        });
    });
});

class Fixtures {
    public readonly establishmentErrorFilter: EstablishmentErrorFilter;
    private readonly jsonMock = jest.fn();
    private readonly statusMock = jest.fn(() => ({ json: this.jsonMock }));

    constructor() {
        this.establishmentErrorFilter = new EstablishmentErrorFilter();
    }

    givenEstablishmentError() {
        return new EstablishmentCreationFailedError("duplicate key");
    }

    whenCatch(exception: EstablishmentCreationFailedError) {
        const host = {
            switchToHttp: () => ({
                getResponse: () => ({
                    status: this.statusMock,
                }),
            }),
        } as any;

        this.establishmentErrorFilter.catch(exception, host);
    }

    thenStatusCalledWith(httpStatus: number) {
        expect(this.statusMock).toHaveBeenCalledWith(httpStatus);
        expect(this.statusMock).toHaveBeenCalledTimes(1);
    }

    thenJsonCalledWith(payload: { code: string; message: string }) {
        expect(this.jsonMock).toHaveBeenCalledWith(payload);
        expect(this.jsonMock).toHaveBeenCalledTimes(1);
    }
}
