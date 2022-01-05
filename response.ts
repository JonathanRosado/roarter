class RoarterResponse extends Response {
  // @ts-ignore
  static text(text: string, init?: ResponseInit) {
    return new RoarterResponse(text, init);
  }

  // @ts-ignore
  static json(obj: any, init?: ResponseInit): RoarterResponse {
    return new RoarterResponse(JSON.stringify(obj), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      ...init,
    });
  }

  // @ts-ignore
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    // @ts-ignore
    super(body, init);
  }
}

export { RoarterResponse as Response };
