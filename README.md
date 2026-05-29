# 🍔 Cardápio Digital Pro - Reconstruído

Este sistema foi recriado para garantir a sincronização em tempo real entre o Painel Admin e o Cardápio.

## 🛠️ Configuração Crucial do Firebase

Para que o salvamento funcione, você **PRECISA** configurar as regras do seu Realtime Database no Console do Firebase:

1. Vá em **Realtime Database** -> **Rules**.
2. Cole as regras abaixo:
```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```
*Isso permite que qualquer pessoa veja o cardápio, mas apenas você (logado) possa alterar os dados.*

## 🚀 Como usar
1. Coloque suas chaves no `js/firebase.js`.
2. Crie um usuário em **Authentication** -> **Users**.
3. Faça login em `login.html`.
4. Cadastre seus produtos e configurações.
5. Abra o `index.html` e veja a mágica acontecer em tempo real!

## 📸 Imagens
Agora você pode subir imagens diretamente da galeria. Elas são convertidas para Base64 e salvas direto no banco de dados, sem precisar configurar o Storage.
