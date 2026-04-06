import { Injectable } from "@nestjs/common";
import { HealthResponse } from "./types";

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
    };
  }
}
