import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const offset = (page - 1) * limit

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // Recherche
  if (search) {
    query = query.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,telephone.ilike.%${search}%`)
  }

  // Tri
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data: clients, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    clients,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()

  const { data: client, error } = await supabase
    .from('clients')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) {
    // Erreur de doublon email
    if (error.code === '23505') {
      return NextResponse.json({ 
        error: 'Un client avec cet email existe déjà' 
      }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(client)
}
