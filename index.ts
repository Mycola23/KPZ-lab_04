import { v4 as uuidv4 } from 'uuid';

//===============================
// taks 1  chain of responsibility

interface Handler {
    setNext(handler: Handler): Handler;
    handle(request: number): string | null;
}

abstract class AbstractSupportHandler implements Handler {
    private nextHandler: Handler | null = null;

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(request: number): string | null {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return null;
    }
}

class Level1FAQ extends AbstractSupportHandler {
    public handle(request: number): string | null {
        if (request === 1) return 'Ви обрали: Часті питання (FAQ). Відповідь: Перезавантажте пристрій.';
        return super.handle(request);
    }
}

class Level2Billing extends AbstractSupportHandler {
    public handle(request: number): string | null {
        if (request === 2) return 'Ви обрали: Питання оплати. Перенаправляю до фінансового відділу...';
        return super.handle(request);
    }
}

class Level3Technical extends AbstractSupportHandler {
    public handle(request: number): string | null {
        if (request === 3) return 'Ви обрали: Технічна підтримка. Опишіть вашу проблему в чаті.';
        return super.handle(request);
    }
}

class Level4Specialist extends AbstractSupportHandler {
    public handle(request: number): string | null {
        if (request === 4) return "Ви обрали: З'єднання з оператором. Очікуйте на лінії...";
        return super.handle(request);
    }
}

//====================================================
// task 5 memento)

class TextDocument {
    constructor(private content: string) {}
    getContent() {
        return this.content;
    }
}

class Memento {
    constructor(private state: TextDocument) {}
    getState() {
        return this.state;
    }
}

class TextEditor {
    private document: TextDocument = new TextDocument('');

    public type(words: string) {
        this.document = new TextDocument(this.document.getContent() + ' ' + words);
    }

    public save(): Memento {
        return new Memento(this.document);
    }

    public restore(memento: Memento) {
        this.document = memento.getState();
    }

    public print() {
        console.log(`Current Content: "${this.document.getContent().trim()}"`);
    }
}

//====================================================
// task 2 mediator
interface IMediator {
    requestLanding(aircraft: Aircraft): void;
    requestTakeOff(aircraft: Aircraft): void;
}
class Runway {
    public readonly id: string = uuidv4();
    public isBusy: boolean = false;

    public highlightRed(): void {
        console.log(`[Runway ${this.id}] LIGHT: RED (Busy)`);
    }

    public highlightGreen(): void {
        console.log(`[Runway ${this.id}] LIGHT: GREEN (Free)`);
    }
}
class Aircraft {
    public name: string;
    private mediator: IMediator;

    constructor(name: string, mediator: IMediator) {
        this.name = name;
        this.mediator = mediator;
    }
    public land(): void {
        console.log(`Aircraft ${this.name}: Requesting landing...`);
        this.mediator.requestLanding(this);
    }

    public takeOff(): void {
        console.log(`Aircraft ${this.name}: Requesting take-off...`);
        this.mediator.requestTakeOff(this);
    }
}

class CommandCentre implements IMediator {
    private runways: Runway[] = [];
    private aircraftAssignments: Map<Aircraft, Runway> = new Map();

    constructor(runways: Runway[]) {
        this.runways = runways;
    }

    public requestLanding(aircraft: Aircraft): void {
        const freeRunway = this.runways.find(r => !r.isBusy);

        if (freeRunway) {
            console.log(`[Tower] Clearing ${aircraft.name} for landing on runway ${freeRunway.id}.`);

            freeRunway.isBusy = true;
            freeRunway.highlightRed();
            this.aircraftAssignments.set(aircraft, freeRunway);

            console.log(`Aircraft ${aircraft.name} has landed.`);
        } else {
            console.log(`[Tower] Denied: All runways are busy. Aircraft ${aircraft.name} must hold.`);
        }
    }

    public requestTakeOff(aircraft: Aircraft): void {
        const assignedRunway = this.aircraftAssignments.get(aircraft);

        if (assignedRunway) {
            console.log(`[Tower] Clearing ${aircraft.name} for take-off from runway ${assignedRunway.id}.`);

            assignedRunway.isBusy = false;
            assignedRunway.highlightGreen();
            this.aircraftAssignments.delete(aircraft);

            console.log(`Aircraft ${aircraft.name} has took off.`);
        } else {
            console.log(`[Tower] Error: Aircraft ${aircraft.name} is not on any runway.`);
        }
    }
}
///=======================================

function main() {
    console.log('=== ЛАБОРАТОРНА РОБОТА 4 ===\n');
    console.log('\nChain of Responsibility');
    const h1 = new Level1FAQ();
    const h2 = new Level2Billing();
    const h3 = new Level3Technical();
    const h4 = new Level4Specialist();
    h1.setNext(h2).setNext(h3).setNext(h4);

    const mockInputs = [1, 3, 5, 4];
    mockInputs.forEach(input => {
        console.log(`Користувач вводить: ${input}`);
        const result = h1.handle(input);
        if (result) console.log(result);
        else console.log('Помилка! Такого пункту немає. Меню повторюється...');
    });
    // =======================================
    console.log('\nmediator');
    const r1 = new Runway();
    const r2 = new Runway();
    // our mediator
    const tower = new CommandCentre([r1, r2]);
    const boeing = new Aircraft('Boeing 747', tower);
    const airbus = new Aircraft('Airbus A320', tower);

    boeing.land();
    console.log('--------------------');

    airbus.land();
    console.log('--------------------');

    const extraPlane = new Aircraft('Cessna 172', tower);
    extraPlane.land();
    console.log('--------------------');

    boeing.takeOff();
    console.log('--------------------');

    extraPlane.land();

    // =======================================
    console.log('\nMemento');
    const editor = new TextEditor();
    const history: Memento[] = [];

    editor.type('Hello');
    editor.print();
    history.push(editor.save());

    editor.type('World!');
    editor.print();

    console.log('Undoing...');
    editor.restore(history.pop()!);
    editor.print();
}
main();
