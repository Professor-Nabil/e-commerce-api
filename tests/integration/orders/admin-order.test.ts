import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Admin Order Management", () => {
  let adminToken: string;
  let customerToken: string;
  let orderId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_status@test.com");
    customerToken = await getCustomerToken("customer_status@test.com");

    // Create a dummy order to test against
    const user = await prisma.user.findUnique({
      where: { email: "customer_status@test.com" },
    });
    const order = await prisma.order.create({
      data: {
        userId: user!.id,
        totalAmount: 100,
        status: "PENDING",
      },
    });
    orderId = order.id;
  });

  it("should deny status update for non-admins", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "COMPLETED" });

    expect(res.statusCode).toBe(403);
  });

  it("should allow admin to update status", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "COMPLETED" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("COMPLETED");
  });
});
