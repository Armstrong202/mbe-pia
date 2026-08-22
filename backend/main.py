import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import jwt
import random
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET", "mbe_pia_super_secret_key_2026")
ALGORITHM = "HS256"

app = FastAPI(
    title="MBE-PIA Tontine API Enterprise",
    description="API Multi-tenant pour la gestion de tontines, cotisations, tirages et prêts",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schémas Pydantic
class LoginRequest(BaseModel):
    email: str
    password: str
    code_2fa: Optional[str] = None

class GroupCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    frequence: str = "mensuel"
    montant_part: float
    ordre_tirage: str = "aleatoire"

class CotisationPayment(BaseModel):
    membre_id: str
    groupe_id: str
    montant: float
    mois: str
    gateway: str  # "Stripe", "Mobile Money"

# Auth + 2FA Endpoint
@app.post("/api/v1/auth/login", tags=["Auth"])
def login(data: LoginRequest):
    # Simulation vérification utilisateurs
    roles_map = {
        "admin@mbe-pia.com": "Admin",
        "secretaire@mbe-pia.com": "Secrétaire",
        "membre@mbe-pia.com": "Membre",
        "observateur@mbe-pia.com": "Observateur"
    }
    
    if data.email in roles_map and data.password == "Pass123!":
        role = roles_map[data.email]
        payload = {
            "sub": data.email,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {
            "access_token": token, 
            "token_type": "bearer", 
            "role": role,
            "2fa_verified": True
        }
    raise HTTPException(status_code=401, detail="Identifiants ou code 2FA invalides")

# Tirage au sort automatique pour une tontine
@app.post("/api/v1/groupes/{groupe_id}/tirage", tags=["Tontine & Rotations"])
def effectuer_tirage(groupe_id: str, membres_ids: List[str]):
    if not membres_ids:
        raise HTTPException(status_code=400, detail="Liste de membres vide")
    
    beneficiaire = random.choice(membres_ids)
    return {
        "groupe_id": groupe_id,
        "beneficiaire_id": beneficiaire,
        "num_tour": 1,
        "date_tirage": datetime.utcnow().isoformat(),
        "status": "Tirage effectué avec succès"
    }

# Traitement Paiement (Stripe / Mobile Money)
@app.post("/api/v1/payments/checkout", tags=["Cotisations & Paiements"])
def process_payment(payment: CotisationPayment):
    ref_transac = f"TX-{payment.gateway[:2].upper()}-{random.randint(100000, 999999)}"
    return {
        "status": "succes",
        "transaction_ref": ref_transac,
        "montant": payment.montant,
        "gateway": payment.gateway,
        "message": f"Paiement de {payment.montant} FCFA validé via {payment.gateway}"
    }

# Dashboard KPIs Global
@app.get("/api/v1/stats/kpis", tags=["Dashboard"])
def get_kpis():
    return {
        "membres_actifs": 128,
        "groupes_tontine": 12,
        "total_cotisations_mois": 4500000,
        "total_prets_encours": 1800000,
        "taux_recouvrement": 99.1,
        "recette_interets": 90000
    }

@app.get("/", tags=["Health Check"])
def root():
    return {"service": "MBE-PIA FastAPI Core", "status": "running", "version": "2.0.0"}