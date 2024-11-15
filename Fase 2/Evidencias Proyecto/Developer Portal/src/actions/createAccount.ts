import { z } from "astro:content";
import { defineAction } from "astro:actions";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { projectAuth } from "@/firebase/config";

export const createAccount = defineAction({
    accept: 'form',
    input: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
    handler: async ({ email, password }) => {
        const _ = await new ProjectConfigManager().getProjectConfig()
        // await createUserWithEmailAndPassword(, email, password)
    }
})