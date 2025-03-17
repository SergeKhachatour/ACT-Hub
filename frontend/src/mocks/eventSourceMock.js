class EventSourceMock {
    constructor() {
        console.warn('EventSource is mocked');
    }
    close() {}
}

module.exports = EventSourceMock; 