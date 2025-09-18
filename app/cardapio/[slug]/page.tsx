import { redirect } from 'next/navigation';

export default async function CardapioRedirect({ params }: { params: { slug: string } }) {
  // Redireciona para a rota principal
  redirect(`/${params.slug}`);
}