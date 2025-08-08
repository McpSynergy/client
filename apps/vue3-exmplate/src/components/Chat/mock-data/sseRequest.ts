export class MockSSEResponse {
  private data: string;
  public controller: {
    close: () => void;
  };

  constructor(data: string) {
    this.data = data;
    this.controller = {
      close: () => {
        console.log('SSE connection closed');
      }
    };
  }

  async getResponse() {
    return {
      ok: true,
      body: {
        getReader: () => {
          let sent = false;
          return {
            read: () => {
              return new Promise<{ done: boolean; value: Uint8Array | null }>((resolve) => {
                if (!sent) {
                  sent = true;
                  setTimeout(() => {
                    const encoder = new TextEncoder();
                    resolve({
                      done: false,
                      value: encoder.encode(this.data)
                    });
                  }, 100);
                } else {
                  resolve({
                    done: true,
                    value: null
                  });
                }
              });
            }
          };
        }
      }
    };
  }
}
