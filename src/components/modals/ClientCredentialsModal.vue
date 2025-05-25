<template>
  <div class="modal-overlay">
    <div class="modal modal-md">
      <div class="modal-header">
        <h2>Kredensial Klien</h2>
        <button type="button" class="modal-close" @click="$emit('close')">
          <span>&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="credentials-container">
          <div class="credential-group">
            <label>Client ID</label>
            <div class="credential-input">
              <input 
                :type="showClientId ? 'text' : 'password'" 
                :value="clientId" 
                readonly
              />
              <button @click="showClientId = !showClientId" class="toggle-visibility" type="button">
                <font-awesome-icon :icon="showClientId ? 'eye-slash' : 'eye'" />
              </button>
              <button @click="copyToClipboard(clientId)" class="copy-button" type="button">
                <font-awesome-icon icon="copy" />
              </button>
            </div>
          </div>

          <div class="credential-group">
            <label>Client Secret</label>
            <div class="credential-input">
              <input 
                :type="showClientSecret ? 'text' : 'password'" 
                :value="clientSecret" 
                readonly
              />
              <button @click="showClientSecret = !showClientSecret" class="toggle-visibility" type="button">
                <font-awesome-icon :icon="showClientSecret ? 'eye-slash' : 'eye'" />
              </button>
              <button @click="copyToClipboard(clientSecret)" class="copy-button" type="button">
                <font-awesome-icon icon="copy" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { successToast } from '@/utils/toast';

const props = defineProps({
  clientId: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  }
});

const showClientId = ref(false);
const showClientSecret = ref(false);

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    successToast('Berhasil disalin ke clipboard');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
.credentials-container {
  padding: 1rem;
}

.credential-group {
  margin-bottom: 1.5rem;
}

.credential-group:last-child {
  margin-bottom: 0;
}

.credential-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.credential-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.credential-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.875rem;
  background-color: #f9fafb;
  color: #374151;
  letter-spacing: 0.05em;
}

.credential-input input[type="password"] {
  letter-spacing: 0.25em;
}

.toggle-visibility,
.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-visibility:hover,
.copy-button:hover {
  background-color: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.copy-button {
  background-color: #f3f4f6;
}

.copy-button:hover {
  background-color: #e5e7eb;
}
</style>
