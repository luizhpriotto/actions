using FluentValidation;
using MediatR;
using SME.SGP.Infra;
using System.Collections.Generic;

namespace SME.SGP.Aplicacao
{
    public class ObterQuestoesItineranciaPorIdQuery : IRequest<IEnumerable<ItineranciaQuestaoDto>>
    {
        public ObterQuestoesItineranciaPorIdQuery(long id)
        {
            Id = id;
        }
        public long Id { get; set; }
    }
    public class ObterQuestoesItineranciaPorIdQueryValidator : AbstractValidator<ObterQuestoesItineranciaPorIdQuery>
    {
        public ObterQuestoesItineranciaPorIdQueryValidator()
        {
            RuleFor(c => c.Id)
            .NotEmpty()
            .WithMessage("O id da itinerância deve ser informado.");

        }
    }
}
