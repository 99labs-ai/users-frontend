"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://users-api-latest.onrender.com";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  country: string;
  created_at: string;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/users/${id}`);
        if (!res.ok) {
          setError("Usuario no encontrado");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setError("Error conectando al API");
      } finally {
        setLoading(false);
      }
    };

    if (id && status === "authenticated") fetchUser();
  }, [id, status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-1 transition"
          >
            ← Volver a la lista
          </button>
          <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const fields = [
    { label: "Nombre", value: `${user.first_name} ${user.last_name}` },
    { label: "Email", value: user.email },
    { label: "Edad", value: `${user.age} años` },
    { label: "País", value: user.country },
    { label: "Creado", value: new Date(user.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) },
    { label: "ID", value: user.id },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-1 transition"
        >
          ← Volver a la lista
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {user.first_name} {user.last_name}
          </h1>

          <dl className="space-y-4">
            {fields.map((f) => (
              <div key={f.label} className="flex items-start">
                <dt className="w-24 text-sm font-medium text-gray-500 shrink-0">{f.label}</dt>
                <dd className="text-sm text-gray-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
