import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["BUYER", "SELLER", "DRIVER"]).default("BUYER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  images: z.array(z.string()).default([]),
});

export const updateListingSchema = createListingSchema.partial();

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  receiverId: z.string(),
  listingId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty").max(1000),
});

export const createOrderSchema = z.object({
  listingId: z.string(),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export const createReviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const initiatePaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
});

export const createDeliverySchema = z.object({
  orderId: z.string(),
  pickupAddress: z.string().min(5, "Pickup address is required").max(500),
  dropoffAddress: z.string().min(5, "Dropoff address is required").max(500),
  price: z.number().nonnegative().optional(),
});

export const updateDeliverySchema = z.object({
  deliveryId: z.string(),
  status: z.enum(["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"]),
  price: z.number().nonnegative().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
