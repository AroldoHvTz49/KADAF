
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

export type EstadoPostulacion = 'En proceso' | 'Entrevista' | 'Rechazada' | 'Contratada';

export type Postulacion = {
  id: string;
  candidato_id: string;
  vacante_id: string;
  estado: EstadoPostulacion;
  cv_path: string;
  created_at: string;
  vacantes?:{titulo:string} | null;
};

export async function obtenerCandidatoAutenticado() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Debes iniciar sesión para postularte.');
  }

  const { data: candidato, error: errorCandidato } = await supabase
    .from('candidatos')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (errorCandidato) {
    throw new Error(errorCandidato.message);
  }

  if (!candidato) {
    throw new Error('No se encontró el perfil del candidato.');
  }

  return {
    usuarioId: data.user.id,
    candidatoId: String(candidato.id)
  };
}

export async function listarPostulaciones(candidatoId: string) {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*, vacantes(titulo)')
    .eq('candidato_id', candidatoId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Postulacion[];
}

export async function elegirYSubirPDF(usuarioId: string) {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false
  });

  if (resultado.canceled || !resultado.assets?.length) {
    return null;
  }

  const archivo = resultado.assets[0];

  if (
    archivo.mimeType !== 'application/pdf' &&
    !archivo.name.toLowerCase().endsWith('.pdf')
  ) {
    throw new Error('Selecciona un archivo PDF.');
  }

  if (archivo.size && archivo.size > 5 * 1024 * 1024) {
    throw new Error('El PDF debe pesar menos de 5 MB.');
  }

  let contenido: ArrayBuffer;

  if (Platform.OS === 'web') {
    contenido = archivo.file
      ? await archivo.file.arrayBuffer()
      : await (await fetch(archivo.uri)).arrayBuffer();
  } else {
  let ruta = archivo.uri;

  if (ruta.startsWith('content://')) {
    const destino = FileSystem.cacheDirectory + `cv_${Date.now()}.pdf`;

    await FileSystem.copyAsync({
      from: ruta,
      to: destino
    });

    ruta = destino;
  }

  const base64 = await FileSystem.readAsStringAsync(ruta, {
    encoding: 'base64'
  });

  contenido = decode(base64);
  }

  const ruta = `${usuarioId}/${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`;

  const { error } = await supabase.storage
    .from('cv-postulaciones')
    .upload(ruta, contenido, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) {
    throw new Error('No se pudo subir el PDF: ' + error.message);
  }

  return ruta;
}

export async function registrarPostulacion(
  candidatoId: string,
  vacanteId: string,
  cvPath: string
) {
  const { error } = await supabase
    .from('postulaciones')
    .insert({
      candidato_id: candidatoId,
      vacante_id: vacanteId,
      cv_path: cvPath,
      estado: 'En proceso'
    });

  if (error) {
    await supabase.storage
      .from('cv-postulaciones')
      .remove([cvPath]);

    if (error.code === '23505') {
      throw new Error('Ya te postulaste a esta vacante.');
    }

    throw new Error(error.message);
  }
}

export async function abrirCV(cvPath: string) {
  const { data, error } = await supabase.storage
    .from('cv-postulaciones')
    .createSignedUrl(cvPath, 60);

  if (error || !data?.signedUrl) {
    throw new Error('No se pudo abrir el currículum.');
  }

  return data.signedUrl;
}
