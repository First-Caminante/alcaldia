/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    adminAccessToken?: string;
    adminRefreshToken?: string;
    adminSessionRefreshed?: boolean;
  }
}
