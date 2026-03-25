import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// PERFORMANCE: Cache headers for public endpoints (1 year for static content)
const cacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
};

// Cache headers for frequently updated content (1 hour)
const shortCacheHeaders = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
};

// Configurações de segurança para login
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION = 30 * 60 * 1000; // 30 minutos em millisegundos

// Funções auxiliares para bloqueio de IP
async function getLoginAttempts(ip: string) {
  const key = `login-attempts:${ip}`;
  const data = await kv.get(key);
  return data || { attempts: 0, blockedUntil: null, lastAttempt: null };
}

async function recordFailedLogin(ip: string) {
  const key = `login-attempts:${ip}`;
  const data = await getLoginAttempts(ip);
  
  const newAttempts = data.attempts + 1;
  const blockedUntil = newAttempts >= LOGIN_MAX_ATTEMPTS 
    ? Date.now() + LOGIN_BLOCK_DURATION 
    : null;
  
  await kv.set(key, {
    attempts: newAttempts,
    blockedUntil,
    lastAttempt: Date.now()
  });
  
  console.log(`[SECURITY] IP ${ip} - Tentativa ${newAttempts}/${LOGIN_MAX_ATTEMPTS}${blockedUntil ? ' - BLOQUEADO' : ''}`);
  
  return { attempts: newAttempts, blockedUntil };
}

async function resetLoginAttempts(ip: string) {
  const key = `login-attempts:${ip}`;
  await kv.del(key);
  console.log(`[SECURITY] IP ${ip} - Tentativas resetadas (login bem-sucedido)`);
}

async function isIPBlocked(ip: string) {
  const data = await getLoginAttempts(ip);
  
  if (data.blockedUntil && Date.now() < data.blockedUntil) {
    const remainingTime = Math.ceil((data.blockedUntil - Date.now()) / 1000 / 60);
    console.log(`[SECURITY] IP ${ip} - BLOQUEADO - ${remainingTime} minutos restantes`);
    return { blocked: true, remainingMinutes: remainingTime };
  }
  
  // Se o tempo de bloqueio expirou, resetar as tentativas
  if (data.blockedUntil && Date.now() >= data.blockedUntil) {
    await resetLoginAttempts(ip);
    return { blocked: false, remainingMinutes: 0 };
  }
  
  return { blocked: false, remainingMinutes: 0 };
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // Obter IP do cliente
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  try {
    // Health check
    if (path === '/make-server-d06f92b7/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'ok' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Categories - PUBLIC
    if (path === '/make-server-d06f92b7/categories' && method === 'GET') {
      const categories = await kv.getByPrefix('category:');
      const result = Array.isArray(categories) ? categories : [];
      
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
      
      // PERFORMANCE: Strip large base64 icons from public response
      // This reduces payload from ~5.8MB to ~5KB
      const lightResult = result.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon && cat.icon.startsWith('data:image') && cat.icon.length > 500 
          ? '' // Strip base64 icons - frontend will use fallback emoji/lucide icons
          : cat.icon,
        description: cat.description,
      }));
      
      return new Response(
        JSON.stringify({ categories: lightResult }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Products - PUBLIC
    if (path === '/make-server-d06f92b7/products' && method === 'GET') {
      const products = await kv.getByPrefix('product:');
      const result = products || [];
      
      // Ordenar por SKU numérico
      result.sort((a, b) => {
        const skuA = parseInt(a.sku) || 0;
        const skuB = parseInt(b.sku) || 0;
        return skuA - skuB;
      });
      
      return new Response(
        JSON.stringify({ products: result }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Products by category - PUBLIC
    if (path.startsWith('/make-server-d06f92b7/products/category/') && method === 'GET') {
      const slug = path.split('/').pop();
      const all = await kv.getByPrefix('product:');
      const products = (all || []).filter((p: any) => p.categorySlug === slug);
      
      // Ordenar por SKU numérico
      products.sort((a, b) => {
        const skuA = parseInt(a.sku) || 0;
        const skuB = parseInt(b.sku) || 0;
        return skuA - skuB;
      });
      
      return new Response(
        JSON.stringify({ products }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Product by ID - PUBLIC
    if (path.startsWith('/make-server-d06f92b7/products/') && method === 'GET' && !path.includes('/category/')) {
      const id = path.split('/').pop();
      const product = await kv.get(`product:${id}`);
      
      if (!product) {
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ product }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Banners - PUBLIC
    if (path === '/make-server-d06f92b7/banners' && method === 'GET') {
      const banners = await kv.getByPrefix('banner:');
      const sorted = (banners || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      return new Response(
        JSON.stringify({ banners: sorted }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PDF Catalogs - PUBLIC
    if (path === '/make-server-d06f92b7/pdf-catalogs' && method === 'GET') {
      const catalogs = await kv.getByPrefix('pdf-catalog:');
      const sorted = (catalogs || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

      return new Response(
        JSON.stringify({ catalogs: sorted }),
        { headers: { ...corsHeaders, ...shortCacheHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Catalog Pages - PUBLIC
    if (path === '/make-server-d06f92b7/catalog-pages' && method === 'GET') {
      console.log('[CATALOG-PAGES] ✅ PUBLIC endpoint hit!');
      const pages = await kv.getByPrefix('catalog-page:');
      console.log('[CATALOG-PAGES] Pages from DB:', pages?.length || 0);
      const sorted = (pages || []).sort((a: any, b: any) => a.position - b.position);
      console.log('[CATALOG-PAGES] Sorted pages:', sorted?.length || 0);
      
      return new Response(
        JSON.stringify({ pages: sorted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin signup
    if (path === '/make-server-d06f92b7/admin/signup' && method === 'POST') {
      const body = await req.json();
      if (!body?.email || !body?.password || !body?.name) {
        return new Response(
          JSON.stringify({ error: 'Missing fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admins = await kv.getByPrefix('admin:');
      if (admins?.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Admin exists' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        user_metadata: { name: body.name, role: 'admin' },
        email_confirm: true
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await kv.set(`admin:${data.user.id}`, {
        id: data.user.id,
        email: body.email,
        name: body.name,
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ success: true, user: data.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin login - check if user is admin
    if (path === '/make-server-d06f92b7/admin/check' && method === 'POST') {
      console.log('[ADMIN CHECK] ========== REQUEST RECEIVED ==========');
      console.log('[ADMIN CHECK] Client IP:', clientIP);
      console.log('[ADMIN CHECK] Headers:', Object.fromEntries(req.headers.entries()));
      
      // Verificar se o IP está bloqueado
      const ipStatus = await isIPBlocked(clientIP);
      if (ipStatus.blocked) {
        console.log(`[ADMIN CHECK] 🚫 IP BLOQUEADO: ${clientIP}`);
        return new Response(
          JSON.stringify({ 
            error: `Muitas tentativas de login falhadas. Tente novamente em ${ipStatus.remainingMinutes} minutos.`,
            isBlocked: true,
            remainingMinutes: ipStatus.remainingMinutes
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const body = await req.json();
      console.log('[ADMIN CHECK] Body:', body);
      
      const { token } = body;

      if (!token) {
        console.error('[ADMIN CHECK] ❌ No token in body!');
        await recordFailedLogin(clientIP);
        return new Response(
          JSON.stringify({ error: 'No token', isAdmin: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ADMIN CHECK] Token received:', token.substring(0, 20) + '...');

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        console.error('[ADMIN CHECK] ❌ Invalid token:', error);
        await recordFailedLogin(clientIP);
        
        // Obter tentativas atuais
        const attempts = await getLoginAttempts(clientIP);
        const remaining = LOGIN_MAX_ATTEMPTS - attempts.attempts;
        
        return new Response(
          JSON.stringify({ 
            error: 'Invalid token', 
            isAdmin: false,
            remainingAttempts: remaining > 0 ? remaining : 0
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ADMIN CHECK] User found:', data.user.id, data.user.email);

      const admin = await kv.get(`admin:${data.user.id}`);
      
      if (!admin) {
        console.error('[ADMIN CHECK] ❌ User is not admin');
        await recordFailedLogin(clientIP);
        
        // Obter tentativas atuais
        const attempts = await getLoginAttempts(clientIP);
        const remaining = LOGIN_MAX_ATTEMPTS - attempts.attempts;
        
        return new Response(
          JSON.stringify({ 
            error: 'Not authorized', 
            isAdmin: false,
            remainingAttempts: remaining > 0 ? remaining : 0
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Login bem-sucedido - resetar tentativas
      await resetLoginAttempts(clientIP);
      console.log('[ADMIN CHECK] ✅ Login successful!');
      
      const allAdmins = await kv.getByPrefix('admin:');
      console.log('[ADMIN CHECK] Admin data:', admin);
      console.log('[ADMIN CHECK] Total admins:', allAdmins?.length);

      return new Response(
        JSON.stringify({ 
          isAdmin: true,
          userId: data.user.id,
          email: data.user.email,
          adminData: admin,
          totalAdmins: allAdmins?.length || 0,
          canPromote: !admin && allAdmins?.length === 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Promote current user to admin (only if no admins exist)
    if (path === '/make-server-d06f92b7/admin/promote' && method === 'POST') {
      const body = await req.json();
      const { token, name, force } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'No token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is already admin
      const existingAdmin = await kv.get(`admin:${data.user.id}`);
      if (existingAdmin) {
        return new Response(
          JSON.stringify({ success: true, message: 'User is already admin', alreadyAdmin: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If force=true, skip the admin count check
      if (!force) {
        // Check if any admins exist
        const admins = await kv.getByPrefix('admin:');
        if (admins?.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Admin already exists. Cannot promote.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Promote user to admin
      await kv.set(`admin:${data.user.id}`, {
        id: data.user.id,
        email: data.user.email,
        name: name || data.user.email,
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      console.log('[ADMIN PROMOTE] ✅ Usuário promovido a admin:', data.user.email, data.user.id);

      return new Response(
        JSON.stringify({ success: true, message: 'User promoted to admin' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // EMERGENCY RESET - Remove all admins (use with caution!)
    if (path === '/make-server-d06f92b7/admin/reset-all-admins' && method === 'POST') {
      console.log('[ADMIN RESET] ⚠️ Removendo TODOS os admins do sistema...');
      
      const admins = await kv.getByPrefix('admin:');
      console.log('[ADMIN RESET] Total de admins encontrados:', admins?.length || 0);
      
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          const adminKey = `admin:${admin.id}`;
          console.log('[ADMIN RESET] Removendo admin:', admin.email, '(key:', adminKey, ')');
          await kv.del(adminKey);
        }
      }

      const remainingAdmins = await kv.getByPrefix('admin:');
      console.log('[ADMIN RESET] ✅ Reset completo! Admins restantes:', remainingAdmins?.length || 0);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All admins removed',
          removedCount: admins?.length || 0,
          remainingCount: remainingAdmins?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIST ALL ADMINS - Debug endpoint
    if (path === '/make-server-d06f92b7/admin/list-all' && method === 'GET') {
      console.log('[ADMIN LIST] 📋 Listando todos os admins...');
      
      const admins = await kv.getByPrefix('admin:');
      console.log('[ADMIN LIST] Total encontrado:', admins?.length || 0);
      
      if (admins && admins.length > 0) {
        admins.forEach((admin, idx) => {
          console.log(`[ADMIN LIST] ${idx + 1}. Email: ${admin.email}, ID: ${admin.id}, Role: ${admin.role}`);
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          total: admins?.length || 0,
          admins: admins || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE SPECIFIC ADMIN - Debug endpoint
    if (path === '/make-server-d06f92b7/admin/delete-by-id' && method === 'POST') {
      const body = await req.json();
      const { adminId } = body;

      if (!adminId) {
        return new Response(
          JSON.stringify({ error: 'Missing adminId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ADMIN DELETE] 🗑️ Deletando admin:', adminId);
      
      const adminKey = `admin:${adminId}`;
      const adminBefore = await kv.get(adminKey);
      
      console.log('[ADMIN DELETE] Admin antes de deletar:', adminBefore);
      
      await kv.del(adminKey);
      
      const adminAfter = await kv.get(adminKey);
      console.log('[ADMIN DELETE] Admin depois de deletar:', adminAfter);

      return new Response(
        JSON.stringify({ 
          success: true,
          deletedKey: adminKey,
          wasDeleted: !adminAfter,
          before: adminBefore,
          after: adminAfter
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // COMPLETE SETUP - Creates admin account from scratch
    if (path === '/make-server-d06f92b7/admin/complete-setup' && method === 'POST') {
      const body = await req.json();
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Missing email, password or name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[COMPLETE SETUP] 🚀 Iniciando setup completo...');
      console.log('[COMPLETE SETUP] Email:', email);

      try {
        // Step 1: DELETE ALL ADMINS USING KV (simpler approach)
        console.log('[COMPLETE SETUP] Step 1: Removendo todos os admins via KV...');
        
        const allAdmins = await kv.getByPrefix('admin:');
        console.log('[COMPLETE SETUP] Total de admins encontrados:', allAdmins?.length || 0);
        
        if (allAdmins && allAdmins.length > 0) {
          const adminIds = allAdmins.map(admin => admin.id);
          console.log('[COMPLETE SETUP] IDs dos admins:', adminIds);
          
          // Delete using mdel (multiple delete)
          const keysToDelete = adminIds.map(id => `admin:${id}`);
          await kv.mdel(keysToDelete);
          console.log('[COMPLETE SETUP] Tentou deletar keys:', keysToDelete);
        }

        // Verify if still exist after deletion attempt
        const remainingAdmins = await kv.getByPrefix('admin:');
        console.log('[COMPLETE SETUP] Admins restantes após deleção:', remainingAdmins?.length || 0);

        // Step 1.5: If kv.mdel didn't work, try direct SQL deletion
        if (remainingAdmins && remainingAdmins.length > 0) {
          console.log('[COMPLETE SETUP] ⚠️ KV delete falhou, tentando SQL direto...');
          
          const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          // Try to delete from kv_store_d06f92b7 table
          const { data: sqlDeleteData, error: sqlDeleteError } = await supabaseAdmin
            .from('kv_store_d06f92b7')
            .delete()
            .like('key', 'admin:%');

          if (sqlDeleteError) {
            console.error('[COMPLETE SETUP] Erro SQL delete:', sqlDeleteError);
          } else {
            console.log('[COMPLETE SETUP] ✅ SQL delete executado');
          }

          // Final verification
          const finalCheck = await kv.getByPrefix('admin:');
          console.log('[COMPLETE SETUP] Verificação final:', finalCheck?.length || 0, 'admins');
        }

        // Step 2: Check if user already exists in Supabase Auth
        console.log('[COMPLETE SETUP] Step 2: Verificando se usuário existe...');
        let userId = null;
        
        // Try to create user (will fail if exists)
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, role: 'admin' },
          email_confirm: true
        });

        if (createError) {
          const errorMsg = createError.message.toLowerCase();
          if (errorMsg.includes('already registered') || errorMsg.includes('already been registered')) {
            console.log('[COMPLETE SETUP] Usuário já existe, buscando ID...');
            
            // User exists, try to get their ID by listing users
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            
            if (listError) {
              console.error('[COMPLETE SETUP] Erro ao listar usuários:', listError);
              return new Response(
                JSON.stringify({ error: 'Error listing users: ' + listError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            const existingUser = users?.find(u => u.email === email);
            if (existingUser) {
              userId = existingUser.id;
              console.log('[COMPLETE SETUP] Usuário encontrado:', userId);
              
              // Update user password
              const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password,
                user_metadata: { name, role: 'admin' }
              });
              
              if (updateError) {
                console.error('[COMPLETE SETUP] Erro ao atualizar senha:', updateError);
              } else {
                console.log('[COMPLETE SETUP] Senha atualizada com sucesso!');
              }
            } else {
              return new Response(
                JSON.stringify({ error: 'User exists but could not find ID' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } else {
            console.error('[COMPLETE SETUP] Erro ao criar usuário:', createError);
            return new Response(
              JSON.stringify({ error: 'Error creating user: ' + createError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          userId = createData.user.id;
          console.log('[COMPLETE SETUP] Novo usuário criado:', userId);
        }

        // Step 3: Register as admin using KV
        console.log('[COMPLETE SETUP] Step 3: Registrando como admin...');
        
        const adminData = {
          id: userId,
          email,
          name,
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        await kv.set(`admin:${userId}`, adminData);
        console.log('[COMPLETE SETUP] ✅ Admin registrado via KV!');

        // Verify insertion
        const verifyAdmin = await kv.get(`admin:${userId}`);
        console.log('[COMPLETE SETUP] Verificação final:', verifyAdmin);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Admin account created successfully',
            userId,
            email,
            adminRegistered: !!verifyAdmin,
            adminData: verifyAdmin
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error: any) {
        console.error('[COMPLETE SETUP] ❌ Erro:', error);
        console.error('[COMPLETE SETUP] Stack trace:', error.stack);
        return new Response(
          JSON.stringify({ 
            error: 'Setup failed: ' + error.message,
            details: error.stack,
            type: error.constructor.name
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Admin routes - verify token first
    if (path.startsWith('/make-server-d06f92b7/admin/') && 
        path !== '/make-server-d06f92b7/admin/signup' &&
        path !== '/make-server-d06f92b7/admin/check' &&
        path !== '/make-server-d06f92b7/admin/promote' &&
        path !== '/make-server-d06f92b7/admin/reset-all-admins' &&
        path !== '/make-server-d06f92b7/admin/list-all' &&
        path !== '/make-server-d06f92b7/admin/delete-by-id' &&
        path !== '/make-server-d06f92b7/admin/complete-setup') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No auth' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'No token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admin = await kv.get(`admin:${data.user.id}`);
      if (!admin) {
        return new Response(
          JSON.stringify({ success: false, error: 'Not admin' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin Categories
      if (path === '/make-server-d06f92b7/admin/categories' && method === 'GET') {
        const categories = await kv.getByPrefix('category:');
        return new Response(
          JSON.stringify({ categories: categories || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path === '/make-server-d06f92b7/admin/categories' && method === 'POST') {
        const data = await req.json();
        if (!data?.name) {
          return new Response(
            JSON.stringify({ error: 'Name required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const slug = (data.slug || data.name).toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const exists = await kv.get(`category:${slug}`);
        if (exists) {
          return new Response(
            JSON.stringify({ error: 'Category exists' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const category = {
          ...data,
          id: Date.now().toString(),
          slug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await kv.set(`category:${slug}`, category);
        return new Response(
          JSON.stringify({ success: true, category }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/categories/') && method === 'PUT') {
        const slug = path.split('/').pop();
        const updates = await req.json();

        const existing = await kv.get(`category:${slug}`);
        if (!existing) {
          return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const category = {
          ...existing,
          ...updates,
          id: existing.id,
          slug,
          updatedAt: new Date().toISOString()
        };

        await kv.set(`category:${slug}`, category);
        return new Response(
          JSON.stringify({ success: true, category }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/categories/') && method === 'DELETE') {
        const slug = path.split('/').pop();
        
        const products = await kv.getByPrefix('product:');
        if (products?.some((p: any) => p.categorySlug === slug)) {
          return new Response(
            JSON.stringify({ error: 'Has products' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await kv.del(`category:${slug}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin Products
      if (path === '/make-server-d06f92b7/admin/products' && method === 'GET') {
        const products = await kv.getByPrefix('product:');
        const result = products || [];
        
        // Ordenar por SKU numérico
        result.sort((a, b) => {
          const skuA = parseInt(a.sku) || 0;
          const skuB = parseInt(b.sku) || 0;
          return skuA - skuB;
        });
        
        return new Response(
          JSON.stringify({ products: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path === '/make-server-d06f92b7/admin/products' && method === 'POST') {
        try {
          console.log('[CREATE PRODUCT] ====== INICIANDO ======');
          console.log('[CREATE PRODUCT] Headers:', Object.fromEntries(req.headers.entries()));
          
          const data = await req.json();
          console.log('[CREATE PRODUCT] Dados recebidos:', JSON.stringify(data, null, 2));

          const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const product = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          console.log('[CREATE PRODUCT] Produto a ser salvo:', JSON.stringify(product, null, 2));

          await kv.set(`product:${id}`, product);
          
          console.log('[CREATE PRODUCT] ✅ Produto salvo com sucesso:', id);
          
          return new Response(
            JSON.stringify({ success: true, product }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('[CREATE PRODUCT] ❌ ERRO:', error);
          console.error('[CREATE PRODUCT] Stack:', error instanceof Error ? error.stack : 'N/A');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao criar produto: ${error instanceof Error ? error.message : String(error)}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      if (path.startsWith('/make-server-d06f92b7/admin/products/') && method === 'GET') {
        const id = path.split('/').pop();
        const product = await kv.get(`product:${id}`);
        
        if (!product) {
          return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/products/') && method === 'PUT') {
        const id = path.split('/').pop();
        const updates = await req.json();

        const existing = await kv.get(`product:${id}`);
        if (!existing) {
          return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const product = {
          ...existing,
          ...updates,
          id,
          updatedAt: new Date().toISOString()
        };

        await kv.set(`product:${id}`, product);
        return new Response(
          JSON.stringify({ success: true, product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/products/') && method === 'DELETE') {
        const id = path.split('/').pop();
        await kv.del(`product:${id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin Banners
      if (path === '/make-server-d06f92b7/admin/banners' && method === 'GET') {
        const banners = await kv.getByPrefix('banner:');
        return new Response(
          JSON.stringify({ banners: banners || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path === '/make-server-d06f92b7/admin/banners' && method === 'POST') {
        const data = await req.json();

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const banner = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await kv.set(`banner:${id}`, banner);
        return new Response(
          JSON.stringify({ success: true, banner }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/banners/') && method === 'PUT') {
        const id = path.split('/').pop();
        const updates = await req.json();

        const existing = await kv.get(`banner:${id}`);
        if (!existing) {
          return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const banner = {
          ...existing,
          ...updates,
          id,
          updatedAt: new Date().toISOString()
        };

        await kv.set(`banner:${id}`, banner);
        return new Response(
          JSON.stringify({ success: true, banner }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (path.startsWith('/make-server-d06f92b7/admin/banners/') && method === 'DELETE') {
        const id = path.split('/').pop();
        await kv.del(`banner:${id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upload
      if (path === '/make-server-d06f92b7/admin/upload' && method === 'POST') {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) {
          return new Response(
            JSON.stringify({ error: 'No file' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const ext = file.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const filePath = `products/${name}`;

        const buffer = new Uint8Array(await file.arrayBuffer());

        const { error } = await supabase.storage
          .from('make-d06f92b7-products')
          .upload(filePath, buffer, { contentType: file.type });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: urlData } = supabase.storage
          .from('make-d06f92b7-products')
          .getPublicUrl(filePath);

        return new Response(
          JSON.stringify({ success: true, url: urlData.publicUrl, path: filePath }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin Orders - Lista todos os pedidos
      if (path === '/make-server-d06f92b7/admin/orders' && method === 'GET') {
        const orders = await kv.getByPrefix('order:');
        const sorted = (orders || []).sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        return new Response(
          JSON.stringify({ orders: sorted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin Customers - Lista todos os clientes
      if (path === '/make-server-d06f92b7/admin/customers' && method === 'GET') {
        const customers = await kv.getByPrefix('customer:');
        const sorted = (customers || []).sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        return new Response(
          JSON.stringify({ customers: sorted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // PDF CATALOGS MANAGEMENT
      // ============================================

      // GET /admin/pdf-catalogs - Lista todos os catálogos PDF
      if (path === '/make-server-d06f92b7/admin/pdf-catalogs' && method === 'GET') {
        const catalogs = await kv.getByPrefix('pdf-catalog:');
        const sorted = (catalogs || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

        return new Response(
          JSON.stringify({ catalogs: sorted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // POST /admin/pdf-catalogs - Adiciona novo catálogo PDF
      if (path === '/make-server-d06f92b7/admin/pdf-catalogs' && method === 'POST') {
        const data = await req.json();
        const { name, pdfUrl, description } = data;

        if (!name || !pdfUrl) {
          return new Response(
            JSON.stringify({ error: 'Missing name or pdfUrl' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const existingCatalogs = await kv.getByPrefix('pdf-catalog:');
        const position = existingCatalogs ? existingCatalogs.length : 0;

        const catalog = {
          id,
          name,
          pdfUrl,
          description: description || '',
          position,
          createdAt: new Date().toISOString()
        };

        await kv.set(`pdf-catalog:${id}`, catalog);

        return new Response(
          JSON.stringify({ success: true, catalog }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DELETE /admin/pdf-catalogs/:id - Remove catálogo PDF
      if (path.startsWith('/make-server-d06f92b7/admin/pdf-catalogs/') && method === 'DELETE') {
        const id = path.split('/').pop();
        await kv.del(`pdf-catalog:${id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // CATALOG PAGES MANAGEMENT
      // ============================================

      // GET /admin/catalog-pages - Lista todas as páginas do catálogo
      if (path === '/make-server-d06f92b7/admin/catalog-pages' && method === 'GET') {
        const pages = await kv.getByPrefix('catalog-page:');
        const sorted = (pages || []).sort((a: any, b: any) => a.position - b.position);
        
        return new Response(
          JSON.stringify({ pages: sorted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // POST /admin/catalog-pages - Adiciona nova página ao catálogo
      if (path === '/make-server-d06f92b7/admin/catalog-pages' && method === 'POST') {
        const data = await req.json();
        const { type, imageUrl } = data;

        if (!imageUrl) {
          return new Response(
            JSON.stringify({ error: 'Missing imageUrl' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get current pages to determine position
        const existingPages = await kv.getByPrefix('catalog-page:');
        const position = existingPages ? existingPages.length : 0;

        const page = {
          id,
          type: type || 'page',
          imageUrl,
          position,
          createdAt: new Date().toISOString()
        };

        await kv.set(`catalog-page:${id}`, page);

        return new Response(
          JSON.stringify({ success: true, page }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DELETE /admin/catalog-pages/:id - Remove página do catálogo
      if (path.startsWith('/make-server-d06f92b7/admin/catalog-pages/') && method === 'DELETE') {
        const id = path.split('/').pop();
        await kv.del(`catalog-page:${id}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // POST /admin/catalog-pages/reorder - Reordena páginas
      if (path === '/make-server-d06f92b7/admin/catalog-pages/reorder' && method === 'POST') {
        const data = await req.json();
        const { pages } = data;

        if (!pages || !Array.isArray(pages)) {
          return new Response(
            JSON.stringify({ error: 'Missing pages array' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update positions for each page
        for (const pageData of pages) {
          const existingPage = await kv.get(`catalog-page:${pageData.id}`);
          if (existingPage) {
            existingPage.position = pageData.position;
            await kv.set(`catalog-page:${pageData.id}`, existingPage);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // PUBLIC: Criar pedido (não requer autenticação)
    if (path === '/make-server-d06f92b7/orders' && method === 'POST') {
      try {
        console.log('[CREATE ORDER] ========== INÍCIO ==========');
        console.log('[CREATE ORDER] Headers:', Object.fromEntries(req.headers.entries()));
        
        const data = await req.json();
        console.log('[CREATE ORDER] Body recebido:', JSON.stringify(data, null, 2));
        
        const { customer, items } = data;

        if (!customer || !items || items.length === 0) {
          console.error('[CREATE ORDER] ❌ Dados faltando - customer:', !!customer, 'items:', items?.length || 0);
          return new Response(
            JSON.stringify({ error: 'Missing customer or items' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Gerar ID único para o pedido
        const orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('[CREATE ORDER] ID gerado:', orderId);
        
        const order = {
          id: orderId,
          customer,
          items,
          totalItems: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        console.log('[CREATE ORDER] Objeto do pedido:', JSON.stringify(order, null, 2));

        // Salvar pedido
        console.log('[CREATE ORDER] Salvando pedido com key:', `order:${orderId}`);
        await kv.set(`order:${orderId}`, order);
        console.log('[CREATE ORDER] ✅ Pedido salvo!');

        // Salvar ou atualizar cliente
        const customerKey = `customer:${customer.cnpj.replace(/\D/g, '')}`;
        console.log('[CREATE ORDER] Customer key:', customerKey);
        
        const existingCustomer = await kv.get(customerKey);
        console.log('[CREATE ORDER] Cliente existente?', !!existingCustomer);
        
        if (existingCustomer) {
          await kv.set(customerKey, {
            ...existingCustomer,
            ...customer,
            updatedAt: new Date().toISOString(),
            totalOrders: (existingCustomer.totalOrders || 0) + 1,
          });
          console.log('[CREATE ORDER] ✅ Cliente atualizado!');
        } else {
          await kv.set(customerKey, {
            ...customer,
            createdAt: new Date().toISOString(),
            totalOrders: 1,
          });
          console.log('[CREATE ORDER] ✅ Novo cliente criado!');
        }

        console.log('[CREATE ORDER] ========== SUCESSO ==========');
        return new Response(
          JSON.stringify({ success: true, orderId, order }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CREATE ORDER] ❌ ========== ERRO ==========');
        console.error('[CREATE ORDER] Mensagem:', error.message);
        console.error('[CREATE ORDER] Stack:', error.stack);
        console.error('[CREATE ORDER] Tipo:', error.constructor.name);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // PUBLIC: Buscar pedido específico por ID (não requer autenticação)
    if (path.startsWith('/make-server-d06f92b7/orders/') && method === 'GET') {
      console.log('[GET ORDER] ========== INÍCIO ==========');
      console.log('[GET ORDER] Path:', path);
      console.log('[GET ORDER] Headers:', Object.fromEntries(req.headers.entries()));
      
      const orderId = path.split('/').pop();
      console.log('[GET ORDER] Order ID extraído:', orderId);
      
      const orderKey = `order:${orderId}`;
      console.log('[GET ORDER] Buscando key:', orderKey);
      
      const order = await kv.get(orderKey);
      console.log('[GET ORDER] Pedido encontrado?', !!order);
      console.log('[GET ORDER] Dados do pedido:', order ? JSON.stringify(order, null, 2) : 'null');
      
      if (!order) {
        console.error('[GET ORDER] ❌ Pedido não encontrado!');
        
        // Debug: listar todos os pedidos
        const allOrders = await kv.getByPrefix('order:');
        console.log('[GET ORDER] Total de pedidos no sistema:', allOrders?.length || 0);
        if (allOrders && allOrders.length > 0) {
          console.log('[GET ORDER] IDs dos pedidos existentes:', allOrders.map((o: any) => o.id));
        }
        
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('[GET ORDER] ========== SUCESSO ==========');
      return new Response(
        JSON.stringify({ order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin: Deletar pedido
    if (path.startsWith('/make-server-d06f92b7/admin/orders/') && method === 'DELETE' && !path.includes('/status')) {
      // Verificar autenticação
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const orderId = path.split('/').pop();
      await kv.del(`order:${orderId}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin: Atualizar status do pedido
    if (path.includes('/admin/orders/') && path.endsWith('/status') && method === 'PATCH') {
      // Verificar autenticação
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const pathParts = path.split('/');
      const orderId = pathParts[pathParts.length - 2]; // Pega o ID antes de /status
      const { status } = await req.json();

      const orderKey = `order:${orderId}`;
      const order = await kv.get(orderKey);

      if (!order) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Atualizar status
      await kv.set(orderKey, {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 404
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

Deno.serve(handler);