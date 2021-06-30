﻿using FluentValidation;
using MediatR;
using System.Collections.Generic;

namespace SME.SGP.Aplicacao
{
    public class ObterTurmasInfantilNaoDeProgramaQuery : IRequest<IEnumerable<Dominio.Turma>>
    {
        public ObterTurmasInfantilNaoDeProgramaQuery(int anoLetivo)
        {
            AnoLetivo = anoLetivo;
        }

        public int AnoLetivo { get; set; }
    }


    public class ObterTurmasInfantilNaoDeProgramaQueryValidator : AbstractValidator<ObterTurmasInfantilNaoDeProgramaQuery>
    {
        public ObterTurmasInfantilNaoDeProgramaQueryValidator()
        {

            RuleFor(c => c.AnoLetivo)
                .NotEmpty()
                .WithMessage("O ano letivo deve ser informado.");
        }
    }
}
