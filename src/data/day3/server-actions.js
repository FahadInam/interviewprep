export const serverActions = {
  id: "server-actions",
  title: "Server Actions",
  icon: "⚙️",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Mutations with server actions, form handling, and optimistic updates",
  concepts: [
    {
      title: "What Server Actions Are — The 'use server' Directive",
      explanations: {
        layman: "A Server Action is a function that runs on the server when a user submits a form. You write a function, add 'use server' at the top, and connect it to a form. When the user clicks Submit, the function runs on the server — not in the browser. You don't need to create an API route or write fetch calls. It's like passing a note directly to the kitchen instead of calling in your order.",
        mid: "Server Actions are async functions that run on the server. Add 'use server' at the top of a file (all exports become actions) or inside a function body. You can call them from Client Components via form actions or event handlers. Next.js creates an HTTP POST endpoint for each action and handles data serialization automatically. They replace the need for manual API routes for mutations.",
        senior: "Server Actions compile into HTTP POST endpoints with auto-generated action IDs. The bundler replaces the function reference in Client Components with an action ID and URL. At runtime, calling the action sends a POST with arguments serialized via React Flight protocol. Actions integrate with React's transition system — calling them from useTransition or form actions triggers a transition, keeping the UI interactive. The return value can include updated RSC payloads for re-rendered UI. Important: action IDs are in the client bundle. Treat every server action as a public endpoint and validate all inputs."
      },
      realWorld: "Every form in a Next.js app — creating posts, updating profiles, deleting items — uses server actions instead of manually creating API routes and fetch calls.",
      whenToUse: "Use for any data mutation: form submissions, database writes, file uploads, sending emails. They are the main way to do mutations in the App Router.",
      whenNotToUse: "Don't use for data fetching — use Server Components instead. Don't use for long-running tasks (>30s) without background jobs. Don't use for real-time features — use WebSockets instead.",
      pitfalls: "Server actions are public endpoints — always authenticate and validate. Large return values are slow because they're serialized as RSC payloads. redirect() must be called outside try/catch (it throws internally). Form actions only work with serializable data — no complex objects in FormData.",
      codeExamples: [
        {
          title: "Defining Server Actions — File-Level vs Inline",
          code: `// Option 1: File-level — ALL exports become server actions
// app/actions.js
"use server";

export async function createPost(formData) {
  const title = formData.get("title");
  const content = formData.get("content");
  await db.post.create({ data: { title, content } });
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } });
}

// Option 2: Inline in a Server Component
// app/posts/page.js (Server Component)
export default function PostsPage() {
  async function handleSubmit(formData) {
    "use server";
    const title = formData.get("title");
    await db.post.create({ data: { title } });
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}`
        }
      ]
    },
    {
      title: "Form Handling with Server Actions & Progressive Enhancement",
      explanations: {
        layman: "Think of a mailbox. You write a letter and drop it in — it gets delivered even if your phone is dead. Progressive enhancement works the same way. When you submit a form with a server action, it works like a normal HTML form. If JavaScript loads, the experience is smoother (no page reload). But even without JavaScript, the form still works.",
        mid: "Server actions can be passed to a form's action prop. This creates a progressively enhanced form. Without JS, it submits as a standard HTML POST. With JS, React intercepts it and sends data via fetch (no reload). useFormStatus gives you loading state (for spinners). useActionState tracks form state like errors and previous values. The formData parameter gets the native FormData object automatically.",
        senior: "Next.js generates a hidden form action URL for each server action. Without JS, the browser POSTs to this URL normally. With JS, React serializes FormData via Flight protocol and processes the returned RSC payload. useActionState (formerly useFormState) keeps state across submissions including validation errors, and works with progressive enhancement. Use the action's return value for validation errors rather than throwing. The bind() pattern (action.bind(null, itemId)) passes extra arguments beyond FormData."
      },
      realWorld: "A checkout form that validates server-side and shows inline errors. Works even if JavaScript fails to load on slow connections.",
      whenToUse: "Use for any user-facing form: sign-up, login, settings, content creation. Design for progressive enhancement when the form is critical (checkout, auth).",
      whenNotToUse: "Don't use for complex multi-step wizards with heavy client-side state. Don't use for real-time input validation — use client-side validation for instant feedback, server action for final check.",
      pitfalls: "FormData only holds strings and files — no JS objects. Use hidden inputs to pass extra data like IDs. useFormStatus must be in a CHILD of the form, not the form component itself. Forgetting loading state leads to users clicking submit multiple times.",
      codeExamples: [
        {
          title: "Progressive Form with Validation and Loading State",
          code: `// app/actions.js
"use server";

export async function createAccount(prevState, formData) {
  const email = formData.get("email");
  const name = formData.get("name");

  // Check the email
  if (!email.includes("@")) {
    return { error: "Invalid email address", success: false };
  }

  // Check if user exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered", success: false };
  }

  await db.user.create({ data: { email, name } });
  return { error: null, success: true };
}

// app/signup/form.js
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAccount } from "@/app/actions";

// Submit button shows loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Account"}
    </button>
  );
}

export default function SignupForm() {
  const [state, formAction] = useActionState(createAccount, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Account created!</p>}
      <SubmitButton />
    </form>
  );
}`
        }
      ]
    },
    {
      title: "Optimistic Updates with useOptimistic",
      explanations: {
        layman: "When you send a text message, your phone shows it right away with a little clock icon — before the server confirms it was sent. That's an optimistic update. The app assumes it will work and shows the result instantly. If something goes wrong, it rolls back. This makes the app feel very fast.",
        mid: "useOptimistic is a React hook that shows a temporary state while a server action is running. You give it the current state and a function that creates the optimistic state. When the action starts, the optimistic state shows right away. When the action finishes, the real data replaces it. If the action fails, the state goes back to what it was before.",
        senior: "useOptimistic forks the React render tree during a transition. The optimistic state renders immediately while the server action runs in the background. On success, React reconciles with the actual state. On failure, it re-renders with the original state. Key challenge: race conditions with rapid submissions. The reducer pattern handles this by accumulating changes. Optimistic UI can conflict with revalidation — revalidated data might flash briefly before settling."
      },
      realWorld: "A todo list where checking a task shows it as complete instantly. A like button that updates the count right away. A chat app where sent messages appear before server confirmation.",
      whenToUse: "Use when the action almost always succeeds (>99%), when instant feedback matters, and when rollback is acceptable.",
      whenNotToUse: "Don't use for actions that often fail (payments, rate-limited APIs). Don't use when the server changes the data a lot (optimistic state would look wrong). Don't use for destructive actions where showing fake success is confusing.",
      pitfalls: "Not handling rollback — users see success then sudden reversal. Race conditions from clicking rapidly. Optimistic state that doesn't match server state (like temporary IDs). Must be used in a Client Component.",
      codeExamples: [
        {
          title: "Optimistic Todo List",
          code: `"use client";
import { useOptimistic } from "react";
import { addTodo } from "@/app/actions";

export default function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    // This function creates the optimistic state
    (currentTodos, newTodoText) => [
      ...currentTodos,
      {
        id: \`temp-\${Date.now()}\`,
        text: newTodoText,
        completed: false,
        pending: true, // Shows visual indicator
      },
    ]
  );

  async function handleSubmit(formData) {
    const text = formData.get("text");
    addOptimisticTodo(text); // Show right away
    await addTodo(formData); // Server confirms later
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input name="text" placeholder="New todo..." required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            style={{ opacity: todo.pending ? 0.5 : 1 }}
          >
            {todo.text}
            {todo.pending && <span> (saving...)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Server Action Security & Error Handling",
      explanations: {
        layman: "Think of a suggestion box at work. Anyone can drop a note in. A smart manager checks if the person is really an employee and if the suggestion makes sense before acting on it. Server actions are like that box — anyone can call them if they know the address. So you MUST check who is making the request and if the data is valid.",
        mid: "Server actions are POST endpoints — anyone can call them, not just your UI. You need: (1) Authentication: check the user's session in every action. (2) Authorization: check if the user has permission. (3) Input validation: use Zod to validate all inputs. (4) Rate limiting: prevent abuse. For errors, return structured objects like { error: message } instead of throwing. redirect() and notFound() throw special errors — don't catch them in try/catch.",
        senior: "Server actions have the same attack surface as API routes: CSRF, injection, replay attacks. Next.js adds CSRF protection by default (Origin header check). Build a wrapper function that handles auth, Zod validation, rate limiting, and structured errors. Use idempotency keys for sensitive operations. Use cookies() and headers() for request context. Separate expected errors (validation failures) from unexpected errors (crashes). Never expose internal errors to clients. redirect() throws NEXT_REDIRECT internally — wrapping it in try/catch will swallow it."
      },
      realWorld: "An admin panel where actions check admin privileges before allowing changes. Input validation catches bad data before it hits the database. Rate limiting stops brute-force attacks.",
      whenToUse: "ALWAYS apply security to every server action. There is no case where you should skip auth and validation.",
      whenNotToUse: "You should never skip security. But the level can vary — a public contact form needs less authorization than an admin action, but both need input validation.",
      pitfalls: "Thinking server actions are private because they're in a 'server' file — they're public endpoints. Catching redirect() or notFound() in try/catch blocks. Returning database errors to clients. Not validating types — formData.get() always returns string or null. Race conditions in read-then-write without locking.",
      codeExamples: [
        {
          title: "Secure Server Action Pattern with Zod Validation",
          code: `"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";

// Define what valid input looks like
const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(prevState, formData) {
  // 1. Check if user is logged in
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("session")?.value);
  if (!session) {
    redirect("/login");
  }

  // 2. Validate input with Zod
  const rawData = {
    name: formData.get("name"),
    bio: formData.get("bio"),
  };

  const parsed = UpdateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  // 3. Check permission
  const profileId = formData.get("profileId");
  if (profileId !== session.userId) {
    return { errors: {}, message: "Unauthorized" };
  }

  // 4. Save to database
  try {
    await db.user.update({
      where: { id: session.userId },
      data: parsed.data,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    return { errors: {}, message: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { errors: {}, message: "Profile updated successfully" };
}`
        },
        {
          title: "Reusable Server Action Wrapper",
          code: `// lib/action-utils.js
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

// Wrapper that adds auth + validation to any action
export function authenticatedAction(schema, handler) {
  return async function (prevState, formData) {
    // Check auth
    const cookieStore = await cookies();
    const session = await verifySession(
      cookieStore.get("session")?.value
    );
    if (!session) redirect("/login");

    // Validate input
    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    // Run the actual handler
    try {
      const result = await handler(parsed.data, session);
      return { success: true, data: result, errors: {} };
    } catch (error) {
      console.error("Action failed:", error);
      return { success: false, errors: {}, message: "Something went wrong" };
    }
  };
}

// Usage:
// export const updateProfile = authenticatedAction(
//   UpdateProfileSchema,
//   async (data, session) => {
//     return await db.user.update({
//       where: { id: session.userId },
//       data,
//     });
//   }
// );`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What are Server Actions and how do they differ from API Routes?",
      answer: "Server Actions are async functions marked with 'use server' that run on the server. Unlike API Routes, you don't create endpoints, parse request bodies, or write fetch calls. You write a function and pass it to a form — Next.js handles the rest. They also integrate with React transitions, so the UI stays interactive during the action and loading states work automatically. Use API Routes for webhooks or non-React clients. Use Server Actions for any mutation from your own UI.",
      difficulty: "easy",
      followUps: [
        "Can you call a server action from a Server Component?",
        "Are there cases where API Routes are still preferred over server actions?"
      ]
    },
    {
      question: "Explain progressive enhancement in the context of server actions and forms.",
      answer: "Progressive enhancement means the form works without JavaScript. When you pass a server action to a form's action prop, Next.js creates a real HTML form action URL. Without JS, the browser does a normal POST, the server runs the action, and returns a new page. With JS, React intercepts the submit, sends data via fetch (no reload), and updates the UI smoothly. To keep this working: use FormData (not JSON), use hidden inputs for extra data, and return errors as state instead of relying on client-side error display.",
      difficulty: "mid",
      followUps: [
        "How do you handle file uploads with progressive enhancement?",
        "How does useActionState support progressive enhancement?"
      ]
    },
    {
      question: "How does useOptimistic work, and what happens when the server action fails?",
      answer: "useOptimistic takes the current state and a reducer function. When you call the updater, React shows the optimistic state right away. The server action runs in the background inside a React transition. If it succeeds, the real data replaces the optimistic state after revalidation. If it fails, React re-renders with the original state, automatically rolling back. The key point: optimistic state only exists during the transition — once it settles (success or failure), the real state takes over.",
      difficulty: "hard",
      followUps: [
        "How do you handle multiple rapid optimistic updates?",
        "What's the relationship between useOptimistic and useTransition?"
      ]
    },
    {
      question: "Why must you treat every server action as a public API endpoint? What security measures should you implement?",
      answer: "Server actions compile into POST endpoints with action IDs visible in the client bundle. Anyone can send a POST request directly, bypassing your UI. You need: (1) Authentication — check session cookies in every action. (2) Authorization — verify user permissions. (3) Input validation — use Zod to validate all inputs. (4) Rate limiting — prevent abuse. (5) CSRF protection — Next.js does this by default via Origin header. Never trust form data types — formData.get() always returns strings.",
      difficulty: "hard",
      followUps: [
        "How does Next.js handle CSRF protection for server actions?",
        "How would you implement rate limiting for server actions?"
      ]
    },
    {
      question: "What is the difference between useFormStatus and useActionState?",
      answer: "useFormStatus gives you { pending, data, method, action } — it tells you if the form is currently submitting. It must be used in a child component of the form, not the form itself. It's for showing loading states (disabled buttons, spinners). useActionState (formerly useFormState) wraps a server action and tracks its return value. It returns [state, formAction, isPending] where state holds whatever the server action returned (errors, success messages). It keeps state across multiple submissions and works with progressive enhancement.",
      difficulty: "mid",
      followUps: [
        "Why can't useFormStatus be used in the same component as the form?",
        "How does useActionState handle progressive enhancement specifically?"
      ]
    },
    {
      question: "How do you handle redirect() and notFound() inside server actions?",
      answer: "redirect() and notFound() work by throwing special errors internally. If you wrap them in try/catch, the catch swallows the error and they stop working. The fix: do your mutation inside try/catch, save the result, then call redirect AFTER the try/catch block. This is a very common bug — developers wrap everything in try/catch and wonder why redirect stops working.",
      difficulty: "mid",
      followUps: [
        "Show the correct code pattern for using redirect with error handling.",
        "Can you redirect to an external URL from a server action?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a CRUD Server Action with Optimistic Delete",
      difficulty: "mid",
      description: "Create a todo list with server actions for creating and deleting todos. The delete action should use optimistic updates so items disappear instantly.",
      solution: `// app/actions.js
"use server";
import { revalidatePath } from "next/cache";

export async function addTodo(formData) {
  const text = formData.get("text");
  if (!text || text.trim().length === 0) {
    return { error: "Todo text is required" };
  }
  await db.todo.create({ data: { text: text.trim(), completed: false } });
  revalidatePath("/todos");
  return { error: null };
}

export async function deleteTodo(id) {
  await db.todo.delete({ where: { id } });
  revalidatePath("/todos");
}

// app/todos/page.js
import { TodoList } from "./todo-list";

export default async function TodosPage() {
  const todos = await db.todo.findMany({ orderBy: { createdAt: "desc" } });
  return <TodoList todos={todos} />;
}

// app/todos/todo-list.js
"use client";
import { useOptimistic } from "react";
import { addTodo, deleteTodo } from "@/app/actions";

export function TodoList({ todos }) {
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, { action, id }) => {
      if (action === "delete") {
        return state.filter((t) => t.id !== id);
      }
      return state;
    }
  );

  async function handleDelete(id) {
    setOptimisticTodos({ action: "delete", id });
    await deleteTodo(id);
  }

  return (
    <div>
      <form action={addTodo}>
        <input name="text" placeholder="What needs to be done?" required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text}</span>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      explanation: "Delete uses useOptimistic to remove the item from the list right away. The reducer filters out the deleted item by ID. When the server confirms and revalidatePath runs, real data replaces the optimistic state. If delete fails, the item comes back."
    },
    {
      title: "Multi-Step Form with Server Action Validation",
      difficulty: "hard",
      description: "Create a server action that validates a registration form with multiple fields, returns field-level errors, and maintains form state across submissions using useActionState.",
      solution: `// app/register/actions.js
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";

// Define validation rules
const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function registerUser(prevState, formData) {
  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Validate
  const parsed = RegisterSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { username: rawData.username, email: rawData.email },
    };
  }

  // Check for existing user
  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
  });

  if (existing) {
    const field = existing.email === parsed.data.email ? "email" : "username";
    return {
      errors: { [field]: [\`This \${field} is already taken\`] },
      values: { username: rawData.username, email: rawData.email },
    };
  }

  // Create user
  await db.user.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  redirect("/login?registered=true");
}

// app/register/page.js
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Registering..." : "Create Account"}
    </button>
  );
}

function FieldError({ errors }) {
  if (!errors) return null;
  return (
    <ul className="errors">
      {errors.map((e, i) => <li key={i} className="error">{e}</li>)}
    </ul>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, {
    errors: {},
    values: {},
  });

  return (
    <form action={formAction} noValidate>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          defaultValue={state.values?.username || ""}
          required
        />
        <FieldError errors={state.errors?.username} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state.values?.email || ""}
          required
        />
        <FieldError errors={state.errors?.email} />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        <FieldError errors={state.errors?.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required />
        <FieldError errors={state.errors?.confirmPassword} />
      </div>
      <SubmitButton />
    </form>
  );
}`,
      explanation: "useActionState tracks what the server action returns across submissions. When validation fails, it returns field-level errors and previous values (to refill the form). redirect() is outside try/catch so it works correctly. The form works without JavaScript too."
    },
    {
      title: "Server Action with bind() for Passing Extra Arguments",
      difficulty: "easy",
      description: "Create a product list where each item has a 'Add to Cart' button that passes the product ID to a server action using bind().",
      solution: `// app/actions.js
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// productId comes from bind(), formData comes from the form
export async function addToCart(productId, formData) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    throw new Error("No cart found");
  }

  const quantity = parseInt(formData.get("quantity") || "1", 10);

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId, productId, quantity },
  });

  revalidatePath("/products");
}

// app/products/page.js
import { addToCart } from "@/app/actions";

export default async function ProductsPage() {
  const products = await db.product.findMany();

  return (
    <div className="product-grid">
      {products.map((product) => {
        // bind() pre-fills productId as the first argument
        const addToCartWithId = addToCart.bind(null, product.id);

        return (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>\${product.price}</p>
            <form action={addToCartWithId}>
              <input type="hidden" name="quantity" value="1" />
              <button type="submit">Add to Cart</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}`,
      explanation: "bind() creates a new function with productId already filled in. FormData becomes the second argument. This works with progressive enhancement because React serializes the bound argument into a hidden field. This is the standard way to pass extra data to server actions."
    }
  ],
  quiz: [
    {
      question: "Where does a server action actually execute?",
      options: [
        "In the browser, but with elevated permissions",
        "On the server, as an HTTP POST endpoint",
        "In a Web Worker on the client",
        "In an Edge Function, separate from the server"
      ],
      correct: 1,
      explanation: "Server actions run on the server. Next.js turns them into HTTP POST endpoints with auto-generated IDs. When the client calls one, it sends a POST request to the server."
    },
    {
      question: "What happens when a form with a server action is submitted but JavaScript has not loaded yet?",
      options: [
        "The form does nothing — server actions require JavaScript",
        "An error is thrown and the user sees a blank page",
        "The form submits as a standard HTML POST and the server action still executes",
        "The form data is queued and submitted when JavaScript loads"
      ],
      correct: 2,
      explanation: "This is progressive enhancement. Server actions in forms work without JavaScript. The browser sends a normal POST request, the server runs the action, and returns a full page response."
    },
    {
      question: "Why must useFormStatus be called in a CHILD component of the form, not in the form component itself?",
      options: [
        "It's a React performance optimization to reduce re-renders",
        "useFormStatus reads from a React context provided by the <form>, so it must be inside the form's subtree",
        "It's a TypeScript limitation with generic form types",
        "It only works with Client Components that are nested one level deep"
      ],
      correct: 1,
      explanation: "useFormStatus reads from a context that the <form> element provides. Like any context consumer, it must be rendered INSIDE the provider. The form component is the provider, so it can't read its own context — a child component must."
    },
    {
      question: "What happens to the optimistic state when a server action called with useOptimistic fails?",
      options: [
        "The optimistic state stays permanently — you must manually revert it",
        "React automatically reverts to the previous state before the optimistic update",
        "The page crashes and shows the nearest error boundary",
        "The optimistic state is cleared and replaced with undefined"
      ],
      correct: 1,
      explanation: "When the action fails, the transition settles with the original state. The optimistic state was temporary — React re-renders with the real state, automatically rolling back."
    },
    {
      question: "Which of the following is a security vulnerability when using server actions?",
      options: [
        "Using Zod to validate form inputs",
        "Checking session cookies at the start of every action",
        "Trusting that only your UI can call the server action since it's in a 'use server' file",
        "Returning generic error messages instead of database error details"
      ],
      correct: 2,
      explanation: "Server actions are public POST endpoints. Anyone can call them directly, bypassing your UI. Trusting that only your UI calls them is a security hole. Always authenticate, authorize, and validate."
    }
  ]
};
