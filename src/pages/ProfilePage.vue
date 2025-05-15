<template>
    <div>
        
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted, watch } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { authService } from '../api/services/authService';
    import { userService } from '../api/services/userService';
    import debounce from 'lodash/debounce';
    import defaultAvatar from '../assets/img/default.png';
    import Swal from 'sweetalert2';
    import { successToast, errorToast, warningToast } from '@/utils/toast'

    const router = useRouter();
</script>

<style scoped>
</style>