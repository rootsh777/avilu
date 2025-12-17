import { NextResponse } from 'next/server'

/**
 * API Route para enviar mensajes a Telegram
 * Incluye logs EXTREMOS para depuración en producción (Amplify)
 */

export async function POST(request: Request) {
  console.log('================ API /send-message =================')

  try {
    // 1️⃣ Leer body
    const body = await request.json()
    console.log('📩 Body recibido:', body)

    const { text, keyboard, message_id } = body

    // 2️⃣ Leer variables de entorno
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log('🔐 TELEGRAM_BOT_TOKEN existe:', !!token)
    console.log('🔐 TELEGRAM_CHAT_ID existe:', !!chatId)
    console.log('🔐 CHAT_ID valor:', chatId)

    if (!token || !chatId) {
      console.error('❌ Variables de entorno faltantes')
      return NextResponse.json(
        { error: 'Variables de entorno faltantes' },
        { status: 500 }
      )
    }

    // 3️⃣ Intentar editar mensaje anterior (si viene message_id)
    if (message_id) {
      console.log('✏️ Intentando editar mensaje:', message_id)

      try {
        const editResponse = await fetch(
          `https://api.telegram.org/bot${token}/editMessageReplyMarkup`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: message_id,
              reply_markup: { inline_keyboard: [] },
            }),
          }
        )

        const editData = await editResponse.json()
        console.log('✏️ Respuesta editMessageReplyMarkup:', editData)
      } catch (editError) {
        console.error('⚠️ Error editando mensaje:', editError)
      }
    } else {
      console.log('ℹ️ No se recibió message_id, se omite edición')
    }

    // 4️⃣ Enviar mensaje nuevo
    console.log('📤 Enviando mensaje a Telegram...')

    const sendResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text || '(texto vacío)',
          reply_markup: keyboard,
        }),
      }
    )

    console.log('📡 Status HTTP Telegram:', sendResponse.status)

    const sendData = await sendResponse.json()
    console.log('📬 Respuesta sendMessage:', sendData)

    // 5️⃣ Verificar resultado
    if (!sendData.ok) {
      console.error('❌ Telegram rechazó el mensaje')
      return NextResponse.json(
        {
          error: 'Telegram error',
          telegram: sendData,
        },
        { status: 500 }
      )
    }

    console.log('✅ Mensaje enviado correctamente')
    console.log('====================================================')

    return NextResponse.json({
      success: true,
      telegram: sendData,
    })

  } catch (error) {
    console.error('🔥 ERROR CRÍTICO EN API /send-message')
    console.error(error)

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
